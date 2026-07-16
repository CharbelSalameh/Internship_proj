const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const savebtn = document.getElementById("SaveBtn");

function resetInput() {
    usernameInput.value = "";
    passwordInput.value = "";
    savebtn.disabled = true;
}

function checkForm() {
    if (
        usernameInput.value !== "" &&
        passwordInput.value !== "" 
    ) {
        savebtn.disabled = false;
    } else {
        savebtn.disabled = true;
    }
} 

async function checkCredentials(event) {
  event.preventDefault();

  try {
    const response = await fetch(
      `${window.API_BASE_URL}/api/connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordInput.value
        })
      }
    );

    if (!response.ok) {
      alert("Invalid Credentials");
      resetInput();
      return;
    }

    const data = await response.json();

    localStorage.setItem("token", data.token);
    window.location.href = "home.html";

  } catch (error) {
    console.error("Login error:", error);
    alert("Could not connect to the server");
  }
}
resetInput();
usernameInput.addEventListener("input", checkForm);
passwordInput.addEventListener("input", checkForm);
savebtn.addEventListener("click",checkCredentials);