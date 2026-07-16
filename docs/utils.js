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

export async function checkHostName(){
 try{  const response = await fetch(`${window.API_BASE_URL}/api/health`);
    if (!response.ok){
        throw new Error ("Can't get the backend name")
    } 
    const data=await response.json();
    alert(data.message)}
    catch(err){
        console.error(error);
    }
}