/* eslint-disable */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const fs = require('fs');
const os = require('os');
const path = require('path');
const FormData = require('form-data');
const { Storage } = require('@google-cloud/storage');

admin.initializeApp();
const storage = new Storage();

exports.processAudio = functions.storage.object().onFinalize(async object => {
  if (!object.contentType.startsWith('audio/')) {
    console.log('Not an audio file.');
    return;
  }

  const fileBucket = object.bucket;
  const filePath = object.name;
  const bucket = storage.bucket(fileBucket);
  const file = bucket.file(filePath);

  file.getMetadata()
    .then(([metadata]) => {
      const storageStream = file.createReadStream();

      const formData = new FormData();
      formData.append('file', storageStream, {
        contentType: metadata.contentType,
        knownLength: metadata.size,
        filename: filePath,
      });
      formData.append('model', 'whisper-1');

      const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
      const OPENAI_API_KEY = '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';

      return fetch(OPENAI_API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      });
    })
    .then(res => res.json())
    .then(json => console.log('Transcription:', JSON.stringify(json)))
    .catch(error => console.error('Error:', error));
});



exports.generateToken = functions.https.onRequest(async (req, res) => {
  const uid = req.query.uid;

  if (!uid) {
    res.status(400).json({ error: 'Missing uid parameter' });
    return;
  }

  try {
    const customToken = await admin.auth().createCustomToken(uid);
    res.json({ token: customToken });
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate token' });
  }
});
