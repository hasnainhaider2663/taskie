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
const db = admin.firestore();

const storage = new Storage();

const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_API_KEY = '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';
exports.processAudio = functions.storage.object().onFinalize(async object => {
  if (!object.contentType.startsWith('audio/')) {
    console.log('Not an audio file.');
    return;
  }

  try {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const bucket = storage.bucket(fileBucket);
    const file = bucket.file(filePath);
    const [metadata] = await file.getMetadata();
    const storageStream = file.createReadStream();
    console.log('meta', JSON.stringify(await file.getMetadata()))
    // Access the user's UID from the custom metadata

    const formData = new FormData();
    formData.append('file', storageStream, {
      contentType: metadata.contentType,
      knownLength: metadata.size,
      filename: filePath,
    });
    formData.append('model', 'whisper-1');

    const fetchOptions = {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    };
    const res = await fetch(OPENAI_API_URL, fetchOptions);
    const json = await res.json();
    const userUid = filePath.split('_')[0];
    const fileId = path.parse(filePath).name;
    console.log('Transcription:', JSON.stringify(json));
    console.log('fileId:', fileId);
    console.log('user', userUid)

    // Save the transcript to the "recordings" table in Firestore
    await db
      .collection('users')
      .doc(userUid)
      .collection('recordings')
      .doc(fileId)
      .update({
        text: json.text,
        status: 'done',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error('Error:', error);
  }
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

exports.createNewUserDocument = functions.auth.user().onCreate(async (user) => {
  try {
    // Create a new document in the "users" collection with the same UID as the new user
    await admin.firestore().collection('users').doc(user.uid).set({
      // Add any initial data you want to store for the user
      displayName: user.displayName,
      email: user.email,
      uid: user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });



    console.log(`User document and recordings subcollection created for user with UID: ${user.uid}`);
  } catch (error) {
    console.error(`Error creating user document and recordings subcollection: ${error}`);
  }
});