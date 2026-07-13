export function checkForm() {
    const fnameInput = document.getElementById("fname");
    const lnameInput = document.getElementById("lname");
    const btnSave = document.getElementById("saveBtn");
    const genderSelect = document.getElementById("selectgender");
    
    if (
        fnameInput.value !== "" &&
        lnameInput.value !== "" &&
        genderSelect.value !== ""
    ) {
        btnSave.disabled = false;
    } else {
        btnSave.disabled = true;
    }
}

export function fillGenderSelect() {
    const genderSelect = document.getElementById("selectgender");
    const genders = ["Male", "Female"];

    genders.forEach(function(item) {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;

        genderSelect.appendChild(option);
    });
}