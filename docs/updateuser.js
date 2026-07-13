import { checkForm, fillGenderSelect } from "./utils.js";

const fnameInput = document.getElementById("fname");
const lnameInput = document.getElementById("lname");
const btnSave = document.getElementById("saveBtn");
const genderSelect = document.getElementById("selectgender");
const imageInput = document.getElementById("imgInput");
const welcomeMessage = document.getElementById("Welcome-Message");
const currentImage = document.getElementById("currentImage");
const noImageMessage = document.getElementById("noImageMessage");

const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

async function getUser() {

    if (!userId) {
        alert("User ID is missing");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/users/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to get user"
            );
        }

        fnameInput.value = data.firstname;
        lnameInput.value = data.lastname;
        genderSelect.value = data.gender;

        welcomeMessage.textContent =
            `Welcome ${data.firstname} ${data.lastname}`;

        if (data.hasImage) {
            currentImage.style.display = "inline-block";
            noImageMessage.style.display = "none";

            currentImage.src =
                `${API_BASE_URL}/api/users/${userId}/image`;

        } else {
            currentImage.style.display = "none";
            noImageMessage.style.display = "block";
            noImageMessage.textContent = "No Image";
        }

        checkForm();

    } catch (error) {
        console.error("Error getting user:", error.message);
        alert("Could not get user");
    }
}

async function updateForm() {

    const personalDetails = new FormData();

    personalDetails.append(
        "firstname",
        fnameInput.value.trim()
    );
    personalDetails.append(
        "lastname",
        lnameInput.value.trim()
    );
    personalDetails.append(
        "gender",
        genderSelect.value
    );
    if (imageInput.files.length > 0) {
        personalDetails.append(
            "image",
            imageInput.files[0]
        );
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/users/${userId}`,
            {
                method: "PATCH",
                body: personalDetails
            }
        );

        const updatedUser = await response.json();

        if (!response.ok) {
            throw new Error(
                updatedUser.error ||
                "Failed to update user"
            );
        }

        alert("User updated successfully");

        window.location.href = "index.html";

    } catch (error) {
        console.error(
            "Error updating user:",
            error.message
        );

        alert(error.message);
    }
}

imageInput.addEventListener("change", function() {

    if (imageInput.files.length > 0) {
        const selectedImage = imageInput.files[0];

        currentImage.style.display = "inline-block";
        noImageMessage.style.display = "none";

        currentImage.src =
            URL.createObjectURL(selectedImage);

    } else {
        getUser();
    }
});

fnameInput.addEventListener("input", checkForm);
lnameInput.addEventListener("input", checkForm);
genderSelect.addEventListener("change", checkForm);
btnSave.addEventListener("click", updateForm);

fillGenderSelect();
getUser();