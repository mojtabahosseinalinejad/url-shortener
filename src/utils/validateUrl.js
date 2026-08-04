export function validateUrl(url) {
  try {
    const parsed = new URL(url);
    console.log(parsed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    console.log(error);
    return false;
  }
}
