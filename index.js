(function () {
  const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
  const INDEX_URL = BASE_URL + 'api/v1/users/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchBy = document.querySelector('.searchby')
  const favIcon = document.getElementById('show-fav-icon')
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  let filter = []
  let paginationData = []
  let pageLink = 1

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data)
    getPageData(1, data)
  })

  function filterData(factor) {
    const regex = new RegExp(factor, "i");
    filter = data.filter(function (item) {
      return (
        item.name.match(regex) ||
        item.age === parseInt(factor) ||
        item.gender.match(regex) ||
        item.surname.match(regex) ||
        item.region.match(regex) ||
        item.birthday.match(regex)
      );
    });
    filter.forEach(item => {
      ["name", "age", "surname"].forEach(key => {
        if (String(item[key]).match(regex)) {
          console.log(`id:${item.id} 資料的${key}包含搜尋關鍵字`);
          searchBy.innerText = "You are searching by " + factor
        }
      });
    });
  }

  function showUser(id) {
    const userName = document.getElementById('show-user-name')
    const userDiscription = document.getElementById('show-user-description')
    const userImage = document.getElementById('show-user-image')
    const favoriteIcon = document.getElementById('show-fav-icon')
    const url = INDEX_URL + id

    axios.get(url).then(response => {
      const data = response.data

      userName.textContent = data.name + " " + data.surname
      // favoriteIcon.innerHTML = `<i class="far fa-heart favorite" data-id="${id}"></i>`
      userImage.innerHTML = `<img src="${data.avatar}" class="img-fluid" id = "user-image" alt="Responsive image">`
      userDiscription.innerHTML = `
      <p>Region : ${data.region}</p>
      <p>Gender : ${data.gender}</p>
      <p>Age : ${data.age}</p>
      <p>Birthday : ${data.birthday}</p>
      <p>Email : ${data.email}</p>
      `

      // 依據favoritePeople去判斷愛心符號實心或空心
      const list = JSON.parse(localStorage.getItem('favoritePeople')) || []

      if (list.some(item => item.id === Number(id))) {
        favoriteIcon.innerHTML = `<i class="fas fa-heart favorite" data-id="${id}"></i>`
      } else {
        favoriteIcon.innerHTML = `<i class="far fa-heart favorite" data-id="${id}"></i>`
      }
    })
  }

  function renderUserList(data) {

    dataPanel.innerHTML = data.map(item =>
      `
        <div class="col-sm-4">
          <div class="card" data-toggle="modal" data-target="#show-user-modal" data-id = "${item.id}">
            <img class="card-img-top" src="${item.avatar}" alt="Card image cap">

          </div>
          <h5 class="my-2 ml-auto mr-auto text-center">${item.name + " " + item.surname}</h5>
        </div>
      `).join('')
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoritePeople')) || []
    const favoritePeople = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      // alert(`already liked ${item.name}`)
      console.log("already liked")
    } else {
      list.push(favoritePeople)
    }
    localStorage.setItem('favoritePeople', JSON.stringify(list))
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    renderUserList(pageData)
  }


  // EventListener:

  // listen to dataPanel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.parentElement.matches('.card')) {
      showUser(event.target.parentElement.dataset.id)
    }
  })

  // listen to search btn
  searchForm.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target.matches('.btn')) {
      let searchOutput = document.getElementById('search-input').value
      if (searchOutput === '') {
        getTotalPages(data)
        getPageData(pageLink, data)
        searchBy.innerText = ""
      }
      filterData(searchOutput)
      getPageData(pageLink, filter)
      getTotalPages(filter)
    }
  })

  searchForm.addEventListener('keyup', (event) => {
    // detect keyup enter
    if (event.keyCode === 13) {
      let searchOutput = document.getElementById('search-input').value
      if (searchOutput === '') {
        getTotalPages(data)
        getPageData(pageLink, data)
        searchBy.innerText = ""
      }
      filterData(searchOutput)
      getPageData(pageLink, filter)
      getTotalPages(filter)
    } else if (event.keyCode === 8) {
      renderUserList(data)
      searchBy.innerText = ""
    }
  })

  // listen to modal
  favIcon.addEventListener('click', (event) => {
    if (event.target.classList.contains('far')) {
      event.target.classList.remove('far')
      event.target.classList.add('fas')
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    pageLink = event.target.dataset.page
    if (event.target.tagName === 'A') {
      getPageData(pageLink, data)
    }
    console.log(pageLink)
  })

})()