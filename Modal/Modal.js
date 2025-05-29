
document.getElementById("modelSave").addEventListener("click", async function (event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const brand_id = document.getElementById("brand").value;

  let count = await window.electron.existModel({name: name, brand_id: brand_id});
  if(count?.data?.count > 0){
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Modal and Brand Name already exist.",
    });
    return false;
  }

  if (name.length === 0 || (name.value == '') ) {
      Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Brand Name OR Modal Name are Required",
      });
      return false;
  }

  try { 
      await window.electron.insertModal(name, brand_id);
      Swal.fire({title: "Add!", text: "Modal inserted successfully!", icon: "success" });
      document.getElementById("name").value = '';
  } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Insert Error: " + error.message,
      });
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  allModels();
});


function openModal(name, id, brandId){
  let editBrand = document.getElementById("editBrand");
  editBrand.querySelector('#name').value = name;
  editBrand.querySelector('#id').value = id;
  let brandSelect = editBrand.querySelector('#brand');
  console.log(brandId, 'brandId');
  if(brandId) {
    brandSelect.value = brandId;
  }
  let brandModal = new bootstrap.Modal(editBrand);
  brandModal.show();
};

flatpickr("#datePicker", {
  mode: "range",
  dateFormat: "Y-m-d",
  onChange: function(selectedDates, dateStr, instance) {
    if(selectedDates.length > 1){
      let tempArray = dateStr.split('to');
      allModels({dateRange: tempArray});
    }
    
  }
});

let search = document.getElementById('search');
if(search){
  search.addEventListener('keyup', function(){
    let val = this.value;
    if(val.length > 1){
      allModels({search: val});
    }else{
      allModels();
    }
  })
}


async function allModels(param = {}) {
  try {
      let all = await window.electron.getAllModels(param);
      let brands = document.querySelector("#models tbody");
      let html = '';
      console.log(all, 'all');
      if(all?.data?.length > 0){
        for (let element of all.data) {
            html += `<tr>
                        <td>${element.id}</td>
                        <td>${element.modelName}</td>
                        <td>${element.brandName}</td>
                        <td>${element.created_at}</td>
                        <td><button type="button" class="btn btn-sm btn btn-outline-success mx-1"   onclick="openModal('${element.modelName}', ${element.id}, ${element.brandId})">Edit</button><button class='btn btn btn-outline-danger btn-sm' onclick={modelsDelete(${element.id})}>Del</button></td>
                    </tr>`;
        }
      }
      brands.innerHTML = html;
  } catch (error) {
      console.error("Insert Error:", error);
  }
}

async function modelsDelete(id){
  try {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then( async (result) => {
      if (result.isConfirmed) {
        await window.electron.deleteModel(id);
        allModels();
      }
    });
  } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Insert Error: " + error.message,
      });
  }
}

document.getElementById("editSaveButton").addEventListener("click", async function (event) {
  event.preventDefault();
  let container = this.parentElement.previousElementSibling
  let name    = container.querySelector("#name").value;
  let id = container.querySelector("#id").value;
  let brand = container.querySelector('#brand').value;
  if (name.length === 0 || brand == '' ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Modal Name or Brand is Required.",
      });
      return;
  }
  try {
      await window.electron.editModel(name, id, brand);
      Swal.fire({title: "Add!", text: "Modal edit successfully!", icon: "success" });
      let editBrand = document.getElementById("editBrand");
      let brandModal = bootstrap.Modal.getInstance(editBrand);
      brandModal.hide();
      allModels();
  } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Insert Error: " + error.message,
      });
  }
});