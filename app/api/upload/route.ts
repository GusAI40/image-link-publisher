// API route that handles file uploads to Supabase Storage
// Processes multiple files, generates unique names, and saves metadata to database
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { notifyUploadComplete, notifyUploadError } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  console.log('[STRESS TEST] Upload API called');
  
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('[API/UPLOAD] Unauthorized: No user session found.');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data containing the uploaded files
    let formData;
    try {
      formData = await request.formData()
      console.log('[STRESS TEST] FormData parsed successfully');
    } catch (formError) {
      console.log('[STRESS TEST] FormData parsing failed:', formError);
      return NextResponse.json({ 
        error: "Failed to parse body as FormData", 
        details: formError instanceof Error ? formError.message : String(formError)
      }, { status: 400 })
    }

    const files = formData.getAll("files") as File[]
    const sessionId = formData.get("sessionId") as string || `stress-test-${Date.now()}`

    console.log(`[STRESS TEST] Received ${files.length} files, sessionId: ${sessionId}`);

    if (!files || files.length === 0) {
      console.log('[STRESS TEST] No files provided');
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadResults = []
    let successCount = 0

    // Process each file individually
    for (const file of files) {
      console.log(`[STRESS TEST] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      try {
        // Generate unique filename to prevent conflicts
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `uploads/${fileName}`

        console.log(`[STRESS TEST] Generated filename: ${fileName}`);

        // Convert File to ArrayBuffer for Supabase upload
        const fileBuffer = await file.arrayBuffer()
        console.log(`[STRESS TEST] File buffer size: ${fileBuffer.byteLength}`);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            duplex: "half",
          })

        if (uploadError) {
          console.log(`[STRESS TEST] Upload error for ${file.name}:`, uploadError)
          uploadResults.push({
            filename: file.name,
            success: false,
            error: uploadError.message,
          })
          continue
        }

        console.log(`[STRESS TEST] Upload successful: ${uploadData.path}`)

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath)
        console.log(`[STRESS TEST] Generated public URL: ${urlData.publicUrl}`)

        // Save metadata to database
        const dbRecord = {
          user_id: user.id,
          upload_session_id: sessionId,
          filename: fileName,
          original_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: filePath,
          public_url: urlData.publicUrl,
          description: null, // Will be filled by AI later
        };

        console.log(`[STRESS TEST] Inserting DB record:`, dbRecord);

        const { data: dbData, error: dbError } = await supabase
          .from("uploaded_images")
          .insert(dbRecord)
          .select()
          .single()

        if (dbError) {
          console.log(`[STRESS TEST] Database error for ${file.name}:`, dbError)
          // Clean up uploaded file if database insert fails
          await supabase.storage.from("images").remove([filePath])
          uploadResults.push({
            filename: file.name,
            success: false,
            error: dbError.message,
          })
          continue
        }

        console.log(`[STRESS TEST] Database record created: ${dbData.id}`)

        uploadResults.push({
          filename: file.name,
          success: true,
          url: urlData.publicUrl,
          id: dbData.id,
        })

        successCount++

        // Trigger async AI description generation
        setTimeout(async () => {
          console.log(`[STRESS TEST] Starting async description for ${file.name}`);
          try {
            const productionUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001';
            const descriptionResponse = await fetch(`${productionUrl}/api/describe-image`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                imageUrl: urlData.publicUrl,
                filename: file.name,
              }),
            })

            if (descriptionResponse.ok) {
              const { description } = await descriptionResponse.json()

              const { error: updateError } = await supabase
                .from("uploaded_images")
                .update({ description })
                .eq("id", dbData.id)

              if (updateError) {
                console.log(`[STRESS TEST] Failed to update description for ${file.name}:`, updateError)
              } else {
                console.log(`[STRESS TEST] Generated description for ${file.name}: ${description?.substring(0, 100)}...`)
              }
            } else {
              const errorText = await descriptionResponse.text()
              console.log(`[STRESS TEST] Failed to generate description for ${file.name}:`, errorText)
            }
          } catch (descError) {
            console.log(`[STRESS TEST] Error generating description for ${file.name}:`, descError)
          }
        }, 1000)

      } catch (fileError) {
        console.log(`[STRESS TEST] File processing error for ${file.name}:`, fileError)
        uploadResults.push({
          filename: file.name,
          success: false,
          error: fileError instanceof Error ? fileError.message : "Unknown error",
        })
      }
    }

    console.log(`[STRESS TEST] Upload complete: ${successCount}/${files.length} successful`);

    return NextResponse.json({
      message: `Successfully uploaded ${successCount} out of ${files.length} files`,
      results: uploadResults,
      sessionId,
    })

  } catch (error) {
    console.log("[STRESS TEST] Upload API error:", error)
    
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
