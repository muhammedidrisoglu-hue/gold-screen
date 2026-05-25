export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://altinapi.com/api/v1/prices?api_key=${process.env.ALTINAPI_KEY}&t=${Date.now()}`
    );

    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      error: "API error",
      message: err.message
    });
  }
}
