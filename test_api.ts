async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/sessions');
    const data = await res.json();
    console.log("API Sessions count:", data.length);
    if (data.length > 0) {
      console.log("First session from API:", data[0]);
    }
  } catch (error) {
    console.error("API Error:", error);
  }
}

testApi();
