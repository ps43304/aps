
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
      let all = await window.electron.getAllBrandsInModal(param);
      console.log(all, 'all');
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

function ucfirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

window.addEventListener("DOMContentLoaded", async () => {
  allBrands();
});


function openAddModal(){
  let editAdd = document.getElementById("addStock");
  let Addmodal = new bootstrap.Modal(editAdd);
  Addmodal.show();
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