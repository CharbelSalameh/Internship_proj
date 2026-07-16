import { checkForm, fillGenderSelect, checkHostName } from "./utils.js";

const fnameInput = document.getElementById("fname");
const lnameInput = document.getElementById("lname");
const btnSave = document.getElementById("saveBtn");
const genderSelect = document.getElementById("selectgender");
const imageInput = document.getElementById("imgInput");

let users = [];

async function loadUsers() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(
            `${window.API_BASE_URL}/api/users`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load users");
        }

        users = await response.json();

        clearTableBody();

        users.forEach(function(user) {
            createRow(user);
        });

    } catch (error) {
        console.error("Error loading users:", error.message);
    }
}

async function clickedSave(event) {

    event.preventDefault();

    const userDetails = {
        firstname: fnameInput.value.trim(),
        lastname: lnameInput.value.trim(),
        gender: genderSelect.value
    };

    const exists = checkUserExistence(userDetails);

    if (exists) {
        alert("This user already exists");
        resetInput();
        return;
    }

    const personalDetails = new FormData();

    personalDetails.append("firstname", fnameInput.value.trim());
    personalDetails.append("lastname", lnameInput.value.trim());
    personalDetails.append("gender", genderSelect.value);

    if (imageInput.files.length > 0) {
        personalDetails.append("image", imageInput.files[0]);
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/users`, {
            method: "POST",
            body: personalDetails
        });

        const savedUser = await response.json();

        if (!response.ok) {
            throw new Error(
                savedUser.message ||
                savedUser.error ||
                "Failed to save user"
            );
        }

        users.push(savedUser);
        createRow(savedUser);
        resetInput();

    } catch (error) {
        console.error("Error saving user:", error.message);
        alert(error.message);
    }
}

function checkUserExistence(personalDetails) {
    return users.some(function(user) {
        return user.firstname.toLowerCase() ===
                    personalDetails.firstname.toLowerCase() &&
               user.lastname.toLowerCase() ===
                    personalDetails.lastname.toLowerCase() &&
               user.gender === personalDetails.gender;
    });
}

function createTable() {
    const tablediv = document.createElement("div");
        tablediv.className = "container d-flex justify-content-center";

    const table = document.createElement("table");
        table.id = "myTable";
        table.classList.add("table", "table-striped", "table-bordered");

        table.style.border = "1px solid black";
        table.style.borderCollapse = "collapse";
        table.style.tableLayout = "fixed";
        table.style.width = "500px";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
        tbody.id = "tableBody";

    const row = document.createElement("tr");

    const header1 = document.createElement("th");
        header1.textContent = "First Name";
        header1.style.border = "1px solid black";
        header1.style.padding = "5px";

    const header2 = document.createElement("th");
        header2.textContent = "Last Name";
        header2.style.border = "1px solid black";

    const header3 = document.createElement("th");
        header3.textContent = "Gender";
        header3.style.border = "1px solid black";

    const header4 = document.createElement("th");
        header4.textContent = "Image";
        header4.style.border = "1px solid black";

    const header5 = document.createElement("th");
        header5.textContent = "Action";
        header5.style.border = "1px solid black";

    row.appendChild(header1);
    row.appendChild(header2);
    row.appendChild(header3);
    row.appendChild(header4);
    row.appendChild(header5);

    thead.appendChild(row);

    table.appendChild(thead);
    table.appendChild(tbody);

    tablediv.appendChild(table);
    document.body.appendChild(tablediv);
}

function clearTableBody() {
    const tableBody = document.getElementById("tableBody");

    if (tableBody) {
        tableBody.innerHTML = "";
    }
}

function createRow(details) {
    const table = document.getElementById("tableBody");

    const row = document.createElement("tr");

    const cell1 = createCell(details.firstname);
    const cell2 = createCell(details.lastname);
    const cell3 = createCell(details.gender);

    const cell4 = document.createElement("td");

    cell4.style.border = "1px solid black";
    cell4.style.textAlign = "center";
    cell4.style.verticalAlign = "middle";

    if (details.hasImage) {
        const image = document.createElement("img");

        image.src = `${window.API_BASE_URL}/api/users/${details._id}/image`;
        image.width = 60;
        image.height = 60;
        image.style.objectFit = "contain";
        image.style.borderRadius = "5px";
        image.alt = "User image";

        image.addEventListener("error", function() {
            cell4.innerHTML = "";
            cell4.textContent = "No Image";
        });

        cell4.appendChild(image);

    } else {
        cell4.textContent = "No Image";
    }

    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);

    const deleteCell = document.createElement("td");
    deleteCell.style.textAlign = "center";
    deleteCell.style.border = "1px solid black";
    deleteCell.style.verticalAlign = "middle";

    const deleteIcon = document.createElement("span");
    deleteIcon.innerHTML = "&#x1F5D1;";
    deleteIcon.style.color = "#FF0000";
    deleteIcon.style.cursor = "pointer";
    deleteIcon.style.marginRight = "10px";

    const editIcon = document.createElement("span");
    editIcon.innerHTML = "&#9998;";
    editIcon.style.color = "#FF0000";
    editIcon.style.cursor = "pointer";

    deleteIcon.addEventListener("click", function() {
        removeRow(row, details._id);
    });

    editIcon.addEventListener("click", function() {
        goToEditPage(details._id);
    });

    deleteCell.appendChild(deleteIcon);
    deleteCell.appendChild(editIcon);
    row.appendChild(deleteCell);

    table.appendChild(row);
}

function createCell(info) {
    const cell = document.createElement("td");

    cell.textContent = info;
    cell.style.border = "1px solid black";
    cell.style.width = "120px";
    cell.style.whiteSpace = "normal";
    cell.style.overflowWrap = "break-word";
    cell.style.verticalAlign = "middle";

    return cell;
}

function removeRow(row, userId) {
    const dialog = document.createElement("dialog");
    dialog.id = "modaldelete";
    dialog.className = "border-0 rounded shadow p-4";

    const message = document.createElement("p");
    message.textContent = "Are you sure you want to remove the record?";
    message.className = "fs-5 mb-4 text-center";

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "d-flex justify-content-center gap-3";

    const yesBtn = document.createElement("button");
    yesBtn.textContent = "Yes";
    yesBtn.className = "btn btn-danger";

    const noBtn = document.createElement("button");
    noBtn.textContent = "No";
    noBtn.className = "btn btn-secondary";

    yesBtn.addEventListener("click", async function() {
        try {
            const response = await fetch(
                `${window.API_BASE_URL}/api/users/${userId}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            users = users.filter(function(user) {
                return user._id !== userId;
            });

            row.remove();
            dialog.close();
            dialog.remove();

        } catch (error) {
            console.error("Error deleting user:", error.message);
            alert("Could not delete user");
        }
    });

    noBtn.addEventListener("click", function() {
        dialog.close();
        dialog.remove();
    });

    buttonsDiv.appendChild(yesBtn);
    buttonsDiv.appendChild(noBtn);

    dialog.appendChild(message);
    dialog.appendChild(buttonsDiv);

    document.body.appendChild(dialog);
    dialog.showModal();
}

function resetInput() {
    fnameInput.value = "";
    lnameInput.value = "";
    genderSelect.value = "";
    imageInput.value = "";
    btnSave.disabled = true;
}

function goToEditPage(userId) {
    window.location.href = `updateuser.html?id=${userId}`;
}

fillGenderSelect();

btnSave.addEventListener("click", clickedSave);
genderSelect.addEventListener("change", checkForm);
fnameInput.addEventListener("input", checkForm);
lnameInput.addEventListener("input", checkForm);
window.addEventListener("load",checkHostName);
createTable();
loadUsers();