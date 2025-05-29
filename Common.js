let refreshPage = document.getElementById('refreshPage');
if(refreshPage){
  refreshPage.addEventListener('click', function(){
      location.reload();
  })
}


let brandDropdown = document.querySelectorAll('.brandDropdown');
if(brandDropdown){
    for (let element of brandDropdown) {
        element.addEventListener('change', async function(){
            let modelList = await window.electron.getBrandByModel({brand_id: this.value});            
            let modelDropdown = document.getElementById('modelDropdown');
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
        });
    }
}

async function getAllDropDownBrand(){
    try {
        let brands = document.querySelectorAll(".brands");
        if(brands){
            let all = await window.electron.getAllBrands();
            for (let elementSelect of brands) {
                if(all?.data?.length > 0){
                  for (let element of all.data) {
                        elementSelect.insertAdjacentHTML(
                            'beforeend',
                            `<option value='${element?.id}'>${ucfirst(element?.name)}</option>`
                        );
                  }
                }
            }
        }
    } catch (error) {
        console.error("Insert Error:", error);
    }
}

async function getAllDropDownModel(){
    try {
        let brands = document.querySelectorAll(".models");
        if(brands){
            let all = await window.electron.getAllModels();
            for (let elementSelect of brands) {
                if(all?.data?.length > 0){
                  for (let element of all.data) {
                        elementSelect.insertAdjacentHTML(
                            'beforeend',
                            `<option value='${element?.id}'>${ucfirst(element?.name)}</option>`
                        );
                  }
                }
            }
        }
    } catch (error) {
        console.error("Insert Error:", error);
    }
}

async function getAllDropDownType(){
    try {
        let typeDropDown = document.querySelectorAll(".typeDropDown");
        if(typeDropDown){
            let all = await window.electron.getAllTypes();
            for (let elementSelect of typeDropDown) {
                if(all?.data?.length > 0){
                  for (let element of all.data) {
                        elementSelect.insertAdjacentHTML(
                            'beforeend',
                            `<option value='${element?.id}'>${ucfirst(element?.name)}</option>`
                        );
                  }
                }
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
    getAllDropDownBrand();
    getAllDropDownType();
});

