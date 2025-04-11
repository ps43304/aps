
document.getElementById("modelSave").addEventListener("click", async function (event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const brand_id = document.getElementById("brand").value;
  if (name.length === 0 || (name.value == '') ) {
      Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Brand Name OR Modal Name are Required",
      });
      return;
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


async function allBrands(param = {}) {
  try {
      let all = await window.electron.getAllBrandsInModal(param);
      let brands = document.querySelector("#brand");
      let html = '';
      if(all?.data?.length > 0){
        for (let element of all.data) {
            brands.insertAdjacentHTML(
              'beforeend',
              `<option value='${element?.id}'>${ucfirst(element?.name)}</option>`
            );
        }
      }
      
  } catch (error) {
      console.error("Insert Error:", error);
  }
}

async function allBrandModels(param = {}) {
  try {
      let all = await window.electron.getAllBrandsInModal(param);
      let brands = document.querySelector("#brandModels");
      let html = '';
      if(all?.data?.length > 0){
        for (let element of all.data) {
            brands.insertAdjacentHTML(
              'beforeend',
              `<option value='${element?.id}'>${ucfirst(element?.name)}</option>`
            );
        }
      }
      
  } catch (error) {
      console.error("Insert Error:", error);
  }
}

function ucfirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

window.addEventListener("DOMContentLoaded", async () => {
  allModels();
  allBrands();
  allBrandModels();
});


function openModal(name, id, brandId){
  let editBrand = document.getElementById("editBrand");
  editBrand.querySelector('#brandName').value = name;
  editBrand.querySelector('#brandId').value = id;
  let brandSelect = editBrand.querySelector('#brandModels');
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

let refreshPage = document.getElementById('refreshPage');
if(refreshPage){
  refreshPage.addEventListener('click', function(){
      location.reload();
  })
}

async function allModels(param = {}) {
  try {
      let all = await window.electron.getAllModels(param);
      let brands = document.querySelector("#models tbody");
      let html = '';
      console.log(all, 'alldddd');
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
        await window.electron.deleteModels(id);
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
  let name    = document.getElementById("brandName").value;
  let brandId = document.getElementById("brandId").value;
  let brandSelect = document.querySelector('#brandModels').value;
  if (name.length === 0 || brandSelect == '' ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Modal Name or Brand is Required.",
      });
      return;
  }
  try {
      await window.electron.editModal(name, brandId, brandSelect);
      Swal.fire({title: "Add!", text: "Modal edit successfully!", icon: "success" });
      let editBrand = document.getElementById("editBrand");
      let brandModal = bootstrap.Modal.getInstance(editBrand);
      brandModal.hide();
      allBrands();
  } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Insert Error: " + error.message,
      });
  }
});