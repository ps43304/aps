function openAddModal(){
  let editAdd = document.getElementById("addStock");
  let Addmodal = new bootstrap.Modal(editAdd);
  Addmodal.show();
};


document.getElementById("saveNew").addEventListener("click", async function (event) {
  event.preventDefault();
  let type_id = document.getElementById("type_name").value;
  let brand_id = document.getElementById("brandDropdown").value;
  let model_id = document.getElementById("modelDropdown").value;
  let qty = document.getElementById("qty").value;
  let price = document.getElementById("price").value; 

  let count = await window.electron.existStock({type_id: type_id, brand_id: brand_id, model_id: model_id});
  if(count?.data?.count > 0){
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "This is already exist.",
    });
    return false;
  }

  if ( type_id == '' || brand_id == '' || model_id == '' || qty == '' || price == '' ) {
      Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "All Fields required.",
      });
      return false;
  }

  try { 
      let param = {type_id: type_id, brand_id: brand_id, model_id: model_id, qty: qty, price: price } 
      await window.electron.insertStock(param);
      Swal.fire({title: "Add!", text: "Stock inserted successfully!", icon: "success" });
      window.location.reload();   
  } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  "Insert Error: " + error.message,
      });
  }
});

async function getAllStock(param = {}) {
    try {
        let all = await window.electron.getAllStock(param);
        let list = document.querySelector("#list tbody");
        let html = '';
        console.log(all, 'all');
        if(all?.data?.length > 0){
          for (let element of all.data) {
              let jsonStringify = encodeURIComponent(JSON.stringify(element));
              html += `<tr>
                          <td>${element.id}</td>
                          <td>${element.typeName}</td>
                          <td>${element.brandName}</td>
                          <td>${element.modelName}</td>
                          <td>${element.qty}</td>
                          <td>${element.price}</td>
                          <td>${element.created_at}</td>
                          <td><button type="button" class="btn btn-sm btn btn-outline-success mx-1"   onclick="openEditModal('${jsonStringify}')">Edit</button><button class='btn btn btn-outline-primary btn-sm' onclick={viewStock(${element.id})}>View</button></td>
                      </tr>`;
          }
        }
        list.innerHTML = html;
    } catch (error) {
        console.error("Insert Error:", error);
    }
}

async function openEditModal(data){
  let details = JSON.parse(decodeURIComponent(data));
  let editPopUp = document.getElementById("editPopUp");
  editPopUp.querySelector('#stock_id').value = details.id;
  editPopUp.querySelector('#type_id').value = details.type_id;
  editPopUp.querySelector('#brandDropdown').value = details.brand_id;
  let modelList = await window.electron.getBrandByModel({brand_id: details.brand_id});            
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
  editPopUp.querySelector('#qty').value = details.qty;
  editPopUp.querySelector('#price').value = details.price;
  let myModal = new bootstrap.Modal(editPopUp);
  myModal.show();
};

async function viewStock(data){
    let viewPopUp = document.getElementById("viewPopUp");
    let details = await window.electron.viewDetail(data);
    let html = '<table class="table">';
    if(details != ''){
            html += `<tr>
                        <th>Type Name : </th>
                        <td>${details.typeName}</td>
                        <th>Brand : </th>
                        <td>${details.brandName}</td>
                    </tr>`;
            html += `<tr>
                    <th>Model Name : </th>
                    <td>${details.modelName}</td>
                    <th>Qty : </th>
                    <td>${details.qty}</td>
                </tr>`;
            html += `<tr>
                <th>Price : </th>
                <td>${details.price}</td>
                <th>Created Date : </th>
                <td>${details.created_at}</td>
            </tr>`;
            html += `<tr>
                        <table class='table'>
                            <tr><td colspan='3'>Inventory</td></tr>
                            <tr><th>Qty</th><th>Stock Movement</th><th>Date</th></tr>`;
            if(details?.inventory && details?.inventory?.length > 0){
                for (let inventory of details?.inventory) {
                    html += `
                        <tr>
                            <td>${inventory?.qty}</td>
                            <td>${inventory?.stock_movement}</td>
                            <td>${inventory?.date}</td>
                        </tr>
                    `; 
                }
            }
            html += `</table></tr>`
    }
    html += '</table>';
    console.log(html);
    viewPopUp.querySelector('.modal-body').innerHTML = html;
    let myModal = new bootstrap.Modal(viewPopUp);
    myModal.show();
  };

window.addEventListener("DOMContentLoaded", async () => {
    getAllStock();
});

let editModel = document.getElementById("editSaveButton");
if(editModel){
    editModel.addEventListener("click", async function (event) {
        event.preventDefault();
        let editPopUp = document.getElementById("editPopUp");
        let type_id = editPopUp.querySelector('#type_id').value;
        let id = editPopUp.querySelector('#stock_id').value;
        let brand_id = editPopUp.querySelector('#brandDropdown').value;
        let model_id = editPopUp.querySelector('#modelDropdown').value;
        let qty = editPopUp.querySelector('#qty').value;
        let price = editPopUp.querySelector('#price').value;
      
        if ( type_id == '' || brand_id == '' || model_id == '' || qty == '' || price == '' ) {
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "All Fields required.",
          });
          return false;
        }
        try {
            let param = {type_id : type_id, id: id, brand_id: brand_id, model_id: model_id, qty: qty, price: price }
            await window.electron.editStock(param);
            Swal.fire({title: "Add!", text: "Stock edit successfully!", icon: "success" });
            let editPopUp = document.getElementById("editPopUp");
            let myModel = bootstrap.Modal.getInstance(editPopUp);
            myModel.hide();
            getAllStock();
        } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text:  "Insert Error: " + error.message,
            });
        }
      });
}

flatpickr("#datePicker", {
  mode: "range",
  dateFormat: "Y-m-d",
  onChange: function(selectedDates, dateStr, instance) {
    if(selectedDates.length > 1){
      let tempArray = dateStr.split('to');
      getAllStock({dateRange: tempArray});
    }
    
  }
});

let search = document.getElementById('search');
if(search){
  search.addEventListener('keyup', function(){
    let val = this.value;
    if(val.length > 1){
      getAllStock({search: val});
    }else{
      getAllStock();
    }
  })
}

