/* eslint-disable */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const fs = require('fs');
const os = require('os');
const path = require('path');

admin.initializeApp();

// Trigger the function when a new file is uploaded
exports.processAudio = functions.storage.object().onFinalize(async object => {
  // Check if the uploaded file is an audio file
  if (!object.contentType.startsWith('audio/')) {
    console.log('Not an audio file.');
    return;
  }

  // Get the download URL for the file
  const fileBucket = object.bucket;
  const filePath = object.name;
  const bucket = admin.storage().bucket(fileBucket);
  const file = bucket.file(filePath);

  // Create an access token for the file with an expiration of 1 hour from now
  const expiresInOneHour = new Date();
  expiresInOneHour.setHours(expiresInOneHour.getHours() + 1);

  const config = {
    action: 'read',
    expires: expiresInOneHour.toISOString(),
  };

  const signedUrl = await file.getSignedUrl(config);
  const audioUrl = signedUrl[0];

  // Download the audio file to a temporary folder
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  await file.download({destination: tempLocalFile});

  // Make a request to OpenAI API
  const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
  const OPENAI_API_KEY = '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';

  const form = new FormData();
  form.append('file', fs.createReadStream(tempLocalFile));
  form.append('model', 'whisper-1');

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });

    const data = await response.json();
    console.log('Transcription:', data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up the temporary file
    fs.unlinkSync(tempLocalFile);
  }
});
