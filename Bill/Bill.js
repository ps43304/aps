function addMoreProduct(e){
    let cloneHtml = e.parentNode.parentNode.parentNode.parentNode.cloneNode(true);
    let inputs = cloneHtml.querySelectorAll('input');
    for (let element of inputs) {
        element.value = '';
    }
    e.classList.add('d-none');
    e.nextElementSibling.classList.remove('d-none');
    document.querySelector('.billBody').appendChild(cloneHtml);
}

function removeAddMore(e){
    e.parentNode.parentNode.parentNode.parentNode.remove();
}

async function billModelDropDown(e){
    console.log(e.parentNode.nextElementSibling.lastElementChild);
    let modelList = await window.electron.getBrandByModel({brand_id: e.value});            
    let modelDropdown = e.parentNode.nextElementSibling.lastElementChild;
    modelDropdown.innerHTML = '';
    modelDropdown.innerHTML = '<option value="">--Select Model--</option>';
    if(modelList?.data){
        for (let opt of modelList?.data) {
            modelDropdown.insertAdjacentHTML(
                'beforeend',
                `<option value='${opt?.id}'>${ucfirst(opt?.name)}</option>`
            );
        }
    }
}

let saveNew = document.querySelector('#saveNew')
if(saveNew){
    saveNew.addEventListener('click', async function(e){
        e.preventDefault();
        let form = saveNew.closest('form');
        let input = form.querySelectorAll('input');
        let select = form.querySelectorAll('select');
        let formdata = new Object();
        let error = false;
        for (let element of input) {
            let name = element.name;
            let value = element.value.trim();
            if(value == '' ){
                error = true;
            }else{
                if (!formdata[name]) {
                    formdata[name] = [];
                }
                formdata[name].push(value);
            }
        }
        for (let element of select) {
            let name = element.name;
            let value = element.value.trim();
            if(value == '' ){
                error = true;
            }else{
                if (!formdata[name]) {
                    formdata[name] = [];
                }
                formdata[name].push(value);
            }
        }

        if(error){
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "All Fields required.",
            });
            return false;
        }

        let numEntries = formdata[Object.keys(formdata)[1]].length;
        
        let tempArray = [];
        for (let i = 0; i < numEntries; i++) {
            let row = {};
            for (let key in formdata) {
                row[key] = formdata[key][i];
            }
            tempArray.push(row);
        }

        let productNotExist = [];
        if(tempArray.length > 0){
            for (let i = 0; i < tempArray.length; i++) {
                let count = await window.electron.existStock( {type_id: tempArray[i]['product'], brand_id:  tempArray[i]['brand'], model_id: tempArray[i]['model']} );
                if(!count.error){
                    if(count?.data?.qty < tempArray[i]?.qty){
                        productNotExist.push(0);
                    }
                }
            }   
        }

        if(productNotExist.length > 0){
             Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Some thing wrong check product Quantity.",
            });
            return false;
        }
        let modelList = await window.electron.insertBill(tempArray); 
    });    
}

async function getAllBill(param = {}) {
    try {
        let all = await window.electron.getAllBill(param);
        let list = document.querySelector("#list tbody");
        let html = '';
        if(all?.data?.length > 0){
            let i = 1;
            for (let element of all.data) {
                let jsonStringify = encodeURIComponent(JSON.stringify(element));
                let status = 'Success';
                let color = 'text-success';
                if(!element.status){
                    status = 'Cancel';
                    color = 'text-error';
                }
                html += `<tr>
                            <td>${i}</td>
                            <td>${element.name}</td>
                            <td>${element.qty}</td>
                            <td>${element.totalPrice}</td>
                            <td>${element.created_at}</td>
                            <td><span class="${color}">${status}</span></td>
                            <td><button type="button" id='pdfButton' class="btn btn-sm btn btn-outline-success mx-1"   >View</button>
                            <button type="button" class="btn btn-sm btn btn-outline-danger mx-1"   onclick="openEditModal('${jsonStringify}')">Cancel</button></td>
                        </tr>`;
                i++;
            }
        }
        list.innerHTML = html;
    } catch (error) {
        console.error("Insert Error:", error);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    getAllBill();
});

document.getElementById('pdfButton').addEventListener('click', () => {
  window.electron.requestPDF();
});
