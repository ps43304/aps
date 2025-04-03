document.getElementById("brandSave").addEventListener("click", async function (event) {
  event.preventDefault();
  const name = document.getElementById("name").value;

  if (name.length === 0) {
      window.electron.showNotification("Error", "Brand Name is Required.");
      return;
  }

  try {
      await window.electron.insertBrand(name);
      window.electron.showNotification("Success", "Brand inserted successfully!");
      allBrands();
  } catch (error) {
      window.electron.showNotification("Error", "Insert Error: " + error.message);
  }
});

document.getElementById("editSaveButton").addEventListener("click", async function (event) {
  event.preventDefault();
  let name    = document.getElementById("brandName").value;
  let brandId = document.getElementById("brandId").value;

  if (name.length === 0) {
      window.electron.showAlert({ title: "Error", text: "Brand Name is Required.", icon: "error" });
      return;
  }
  try {
      await window.electron.editBrand(name, brandId);
      allBrands();
  } catch (error) {
      console.log({ title: "Error", text: "Insert Error: " + error.message, icon: "error" });
  }
});


async function brandDelete(id){
  try {
    await window.electron.deleteBrand(id);
    allBrands();
  } catch (error) {
      console.log({ title: "Error", text: "Insert Error: " + error.message, icon: "error" });
  }
}

async function allBrands() {
  try {
      let all = await window.electron.getAllBrands();
      let brands = document.querySelector("#brands tbody");
      let html = '';
      for (let element of all.data) {
          html += `<tr>
                      <td>${element.id}</td>
                      <td>${element.name}</td>
                      <td>${element.created_at}</td>
                      <td><button type="button" class="btn btn-sm btn btn-outline-success mx-1"   onclick="openModal('${element.name}', ${element.id})">Edit</button><button class='btn btn btn-outline-danger btn-sm' onclick={brandDelete(${element.id})}>Del</button></td>
                  </tr>`;
      }
      brands.innerHTML = html;
  } catch (error) {
      console.error("Insert Error:", error);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  allBrands();
});


function openModal(name, id){
  let editBrand = document.getElementById("editBrand");
  editBrand.querySelector('#brandName').value = name;
  editBrand.querySelector('#brandId').value = id;
  let brandModal = new bootstrap.Modal(editBrand);
  brandModal.show();
};