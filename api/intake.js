export default async function handler(req, res) {

  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://www.chefcalvinskitchen.com'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {

    return res.status(200).json({
      success: true,
      message: 'Chef Calvin Intake API is working'
    });

  }

  if (req.method === 'POST') {

    console.log('Form Submission:', req.body);

    return res.status(200).json({
      success: true,
      received: true
    });

  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });

}
