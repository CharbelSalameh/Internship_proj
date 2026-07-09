  const params = new URLSearchParams(window.location.search);
  const nameFromUrl = params.get("name") || "";

  fetch(`${API_BASE_URL}/api/profile-data?name=${encodeURIComponent(nameFromUrl)}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('welcome-message').textContent = `Welcome ${data.personName}`;
    })
    .catch(err => {
      console.error("Error fetching profile name:", err);
      document.getElementById('welcome-message').textContent = "Welcome Guest";
    });