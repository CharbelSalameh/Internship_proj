const fnameInput = document.getElementById("fname");
const lnameInput = document.getElementById("lname");
const btnSave = document.getElementById("saveBtn");
const genderSelect = document.getElementById("selectgender");

const genders = ["Male", "Female"];

let users = [];

function checkForm() {
    if (fnameInput.value !== "" && lnameInput.value !== "" && genderSelect.value !== "") {
        btnSave.disabled = false;
    } else {
        btnSave.disabled = true;
    }
}

genders.forEach(function(item) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    genderSelect.appendChild(option);
});

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users`);

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

async function clickedSave() {
    const personalDetails = {
        firstname: fnameInput.value,
        lastname: lnameInput.value,
        gender: genderSelect.value
    };

    const exists = checkUserExistence(personalDetails);

    if (exists) {
        alert("This user already exists");
        resetInput();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(personalDetails)
        });

        if (!response.ok) {
            throw new Error("Failed to save user");
        }

        const savedUser = await response.json();

        users.push(savedUser);
        createRow(savedUser);
        resetInput();

    } catch (error) {
        console.error("Error saving user:", error.message);
        alert("Could not save user");
    }
}

function checkUserExistence(personalDetails) {
    return users.some(function(user) {
        return user.firstname === personalDetails.firstname &&
               user.lastname === personalDetails.lastname &&
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
    table.style.width = "400px";

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
    header4.textContent = "Action";
    header4.style.border = "1px solid black";

    row.appendChild(header1);
    row.appendChild(header2);
    row.appendChild(header3);
    row.appendChild(header4);

    thead.appendChild(row);

    table.appendChild(thead);
    table.appendChild(tbody);

    tablediv.appendChild(table);
    document.body.appendChild(tablediv);
}

function clearTableBody() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";
}

function createRow(details) {
    const table = document.getElementById("tableBody");

    const row = document.createElement("tr");

    const cell1 = createCell(details.firstname);
    const cell2 = createCell(details.lastname);
    const cell3 = createCell(details.gender);

    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);

    const deleteCell = document.createElement("td");
    deleteCell.style.textAlign = "center";
    deleteCell.style.border = "1px solid black";

    const icon = document.createElement("span");
    icon.innerHTML = "&#x1F5D1;";
    icon.style.color = "#FF0000";
    icon.style.cursor = "pointer";

    icon.addEventListener("click", function() {
        removeRow(row, details._id);
    });

    deleteCell.appendChild(icon);
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
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: "DELETE"
            });

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
    btnSave.disabled = true;
}

btnSave.addEventListener("click", clickedSave);
genderSelect.addEventListener("change", checkForm);
fnameInput.addEventListener("input", checkForm);
lnameInput.addEventListener("input", checkForm);

createTable();
loadUsers();