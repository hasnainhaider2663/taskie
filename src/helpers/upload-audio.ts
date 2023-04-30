import axios from 'axios';
import getFirebaseStorageToken from '../helpers/get-firebase-token';

const uploadAudio = async (
  audioPath: string,
  filename: string,
  uid: string,
) => {
  if (audioPath) {
    const token = await getFirebaseStorageToken(uid);
    console.log('token', token);
    if (!token) {
      console.error('Failed to get Firebase Storage token');
      return;
    }

    try {
      const url = `https://firebasestorage.googleapis.com/v0/b/taskie-38162.appspot.com/o?uploadType=media&name=${encodeURIComponent(
        filename,
      )}`;
      const data = new FormData();
      data.append('file', {
        uri: audioPath,
        type: 'audio/m4a',
        name: filename,
      });
      console.log('url', url);
      console.log('data', data);

      // Add metadata with user UID
      const metadata = {
        contentType: 'application/json',
        metadata: {
          uid,
        },
      };

      // Convert metadata to JSON string
      const metadataString = JSON.stringify(metadata);

      const result = await axios.post(url, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
          'X-Goog-Metadata': metadataString, // Include metadata in the request header
        },
      });

      console.log('File uploaded successfully !!!!!');

      return result;
    } catch (error) {
      console.error('Error uploading file:', JSON.stringify(error, null, 2));
    }
  }
};

export default uploadAudio;
