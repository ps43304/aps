
document.getElementById("brandSave").addEventListener("click", async function (event) {
  event.preventDefault();
  const name = document.getElementById("name").value;

  if (name.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Brand Name is Required.",
      });
      return;
  }

  try {
      await window.electron.insertBrand(name);
      Swal.fire({title: "Add!", text: "Brand inserted successfully!", icon: "success" });
      document.getElementById("name").value = '';
      allBrands();
  } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Insert Error: " + error.message,
      });
  }
});

document.getElementById("editSaveButton").addEventListener("click", async function (event) {
  event.preventDefault();
  let name    = document.getElementById("brandName").value;
  let brandId = document.getElementById("brandId").value;

  if (name.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Brand Name is Required.",
      });
      return;
  }
  try {
      await window.electron.editBrand(name, brandId);
      Swal.fire({title: "Add!", text: "Brand edit successfully!", icon: "success" });
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


async function brandDelete(id){
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
        await window.electron.deleteBrand(id);
        allBrands();
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

async function allBrands(param = {}) {
  try {
      let all = await window.electron.getAllBrands(param);
      let brands = document.querySelector("#brands tbody");
      let html = '';
      console.log(all, 'all');
      if(all?.data?.length > 0){
        for (let element of all.data) {
            html += `<tr>
                        <td>${element.id}</td>
                        <td>${element.name}</td>
                        <td>${element.created_at}</td>
                        <td><button type="button" class="btn btn-sm btn btn-outline-success mx-1"   onclick="openModal('${element.name}', ${element.id})">Edit</button><button class='btn btn btn-outline-danger btn-sm' onclick={brandDelete(${element.id})}>Del</button></td>
                    </tr>`;
        }
      }
      brands.innerHTML = html;
  } catch (error) {
      console.error("Insert Error:", error);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  allBrands();
});

async function dropDownBrand(){
    let brandDropdown = document.querySelector('#brandDropdown');
    let all = await window.electron.getAllBrandsInType();
    

}


function openModal(name, id){
  let editBrand = document.getElementById("editBrand");
  editBrand.querySelector('#brandName').value = name;
  editBrand.querySelector('#brandId').value = id;
  let brandModal = new bootstrap.Modal(editBrand);
  brandModal.show();
};

flatpickr("#datePicker", {
  mode: "range",
  dateFormat: "Y-m-d",
  onChange: function(selectedDates, dateStr, instance) {
    if(selectedDates.length > 1){
      let tempArray = dateStr.split('to');
      allBrands({dateRange: tempArray});
    }
    
  }
});

let search = document.getElementById('search');
if(search){
  search.addEventListener('keyup', function(){
    let val = this.value;
    if(val.length > 1){
      allBrands({search: val});
    }else{
      allBrands();
    }
  })
}

let refreshPage = document.getElementById('refreshPage');
if(refreshPage){
  refreshPage.addEventListener('click', function(){
      location.reload();
  })
}