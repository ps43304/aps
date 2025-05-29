
document.getElementById("saveNew").addEventListener("click", async function (event) {
  event.preventDefault();
  let name = document.getElementById("name").value;
  let brand_id = document.getElementById("brandDropdown").value;
  let model_id = document.getElementById("modelDropdown").value;
  let HSN = document.getElementById("HSN").value;

  if (name.length === 0 || (name.value == '') || brand_id.value == '' || model_id.value == '' || HSN.value == '' ) {
      Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Product Name, HSN code, Brand,  OR Modal Name are Required",
      });
      return false;
  }

  let count = await window.electron.existType({name: name, brand_id: brand_id, model_id: model_id});
  if(count?.data?.count > 0){
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Type, Brand and Model Name already exist.",
    });
    return false;
  }


  try { 
      await window.electron.insertType({name: name, brand_id: brand_id, model_id: model_id, HSN: HSN });
      Swal.fire({title: "Add!", text: "Product inserted successfully!", icon: "success" });
      document.getElementById("name").value = '';
  } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Insert Error: " + error.message,
      });
  }
});

async function allTypes(param = {}) {
  try {
      let all = await window.electron.getAllTypes(param);
      let list = document.querySelector("#list tbody");
      let html = '';
      console.log(all, 'all');
      if(all?.data?.length > 0){
        for (let element of all.data) {
            let jsonStringify = encodeURIComponent(JSON.stringify(element));
            html += `<tr>
                        <td>${element.id}</td>
                        <td>${element.name}</td>
                        <td>${element.brandName}</td>
                        <td>${element.modelName}</td>
                        <td>${element.created_at}</td>
                        <td><button type="button" class="btn btn-sm btn btn-outline-success mx-1"   onclick="openModal('${jsonStringify}')">Edit</button><button class='btn btn btn-outline-danger btn-sm' onclick={deleteType(${element.id})}>Del</button></td>
                    </tr>`;
        }
      }
      list.innerHTML = html;
  } catch (error) {
      console.error("Insert Error:", error);
  }
}


async function openModal(data){
    let details = JSON.parse(decodeURIComponent(data));
    let editPopUp = document.getElementById("editPopUp");
    editPopUp.querySelector('#name').value = details.name;
    editPopUp.querySelector('#id').value = details.id;
    editPopUp.querySelector('#brandDropdown').value = details.brand_id;

    let modelList = await window.electron.getBrandByModel({brand_id: details.brand_id}); 
    console.log(modelList, 'modelList');           
    let modelDropdown = editPopUp.querySelector('#modelDropdown');
    modelDropdown.innerHTML = '';
    modelDropdown.innerHTML = '<option value="">--Select Model--</option>';
    if(modelList?.data){
        for (let opt of modelList?.data) {
            let selected = '';
            if(opt.id == details.model_id){
                selected = 'selected';
            }
            modelDropdown.insertAdjacentHTML(
                'beforeend',
                `<option ${selected} value='${opt?.id}'>${ucfirst(opt?.name)}</option>`
            );
        }
    }

    editPopUp.querySelector('#modelDropdown').value = details.model_id;
    let myModal = new bootstrap.Modal(editPopUp);
    myModal.show();
};

let editModel = document.getElementById("editSaveButton");
if(editModel){
    editModel.addEventListener("click", async function (event) {
        event.preventDefault();
        let editPopUp = document.getElementById("editPopUp");
        let name = editPopUp.querySelector('#name').value;
        let id = editPopUp.querySelector('#id').value;
        let brandDropdown = editPopUp.querySelector('#brandDropdown').value;
        let modelDropdown = editPopUp.querySelector('#modelDropdown').value;
      
        if (name.length === 0 || id == '' || brandDropdown == '' || modelDropdown == '') {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text:  "All feilds required.",
            });
            return;
        }
        try {
            let param = {name : name, id: id, brand_id: brandDropdown, model_id: modelDropdown }
            await window.electron.editTypes(param);
            Swal.fire({title: "Add!", text: "Type edit successfully!", icon: "success" });
            let editPopUp = document.getElementById("editPopUp");
            let myModel = bootstrap.Modal.getInstance(editPopUp);
            myModel.hide();
            allTypes();
        } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text:  "Insert Error: " + error.message,
            });
        }
      });
}

async function deleteType(id){
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
          await window.electron.deleteType(id);
          allTypes();
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


window.addEventListener("DOMContentLoaded", async () => {
  allTypes();
});

flatpickr("#datePicker", {
  mode: "range",
  dateFormat: "Y-m-d",
  onChange: function(selectedDates, dateStr, instance) {
    if(selectedDates.length > 1){
      let tempArray = dateStr.split('to');
      allTypes({dateRange: tempArray});
    }
    
  }
});

let search = document.getElementById('search');
if(search){
  search.addEventListener('keyup', function(){
    let val = this.value;
    if(val.length > 1){
      allTypes({search: val});
    }else{
      allTypes();
    }
  })
}

