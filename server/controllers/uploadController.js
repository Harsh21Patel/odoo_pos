import ImageKit from '@imagekit/nodejs';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// GET /api/upload/auth  — returns signed auth params for client-side upload
export const getAuthParams = (req, res) => {
  try {
    const result = imagekit.helper.getAuthenticationParameters();
    // Also send publicKey so the client can attach it
    res.json({
      ...result,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate ImageKit auth params', error: err.message });
  }
};