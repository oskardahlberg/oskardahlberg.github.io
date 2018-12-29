
function createScale(leftText, rightText) {
  var leftEl = document.createElement('div')
  leftEl.className = 'label left'
  leftEl.innerText = leftText

  var rightEl = document.createElement('div')
  rightEl.className = 'label right'
  rightEl.innerText = rightText

  var inputsEl = document.createElement('div')
  inputsEl.className = 'inputs'

  var inputs = []

  for (var i = 0; i < 11; i++) {
    var inputEl = document.createElement('input')
    inputEl.type = 'text'
    inputEl.placeholder = i
    inputsEl.appendChild(inputEl)

    inputs.push(inputEl)
  }

  var el = document.createElement('div')
  el.className = 'scale'
  el.appendChild(leftEl)
  el.appendChild(inputsEl)
  el.appendChild(rightEl)

  function read() {
    var a = null
    var b = null
    var c = null

    for (var i in inputs) {
      var value = inputs[i].value.trim().toLowerCase()
      if (value === 'a') {
        if (a !== null) return null
        a = parseInt(i)
      }
      else if (value === 'b') {
        if (b !== null) return null
        b = parseInt(i)
      }
      else if (value === 'c') {
        if (c !== null) return null
        c = parseInt(i)
      }
      else if (value !== '') return null
    }

    if (a === null || b === null || c === null) return null

    return [a, b, c]
  }

  function submit() {
    var result = read()
    
    if (result === null) {
      el.className = 'scale error'
      el.onclick = function () {
        el.className = 'scale'
        el.onclick = null
      }
    }
    
    return result
  }


  return { el: el, submit: submit }
}

function createTriplet(name, a, b, c, scales) {
  var headerEl = document.createElement('h3')
  headerEl.innerText = name + '.'

  var valuesEl = document.createElement('div')
  valuesEl.className = 'values'
  valuesEl.innerHTML =
    '<div><b>a</b>) ' + a + '</div>' +
    '<div><b>b</b>) ' + b + '</div>' +
    '<div><b>c</b>) ' + c + '</div>'

  var scalesEl = document.createElement('div')
  scalesEl.className = 'scales'

  var submits = {}

  for (var key in scales) {
    var scale = createScale(
      scales[key].left,
      scales[key].right
    )
    scalesEl.appendChild(scale.el)
    submits[key] = scale.submit
  }

  var el = document.createElement('div')
  el.className = 'triplet'
  el.appendChild(headerEl)
  el.appendChild(valuesEl)
  el.appendChild(scalesEl)

  function submit () {
    var valid = true
    var result = {}

    for (var key in submits) {
      var value = submits[key]()
      if (value === null) valid = false
      else {
        result['t' + name + 'a_' + key] = value[0]
        result['t' + name + 'b_' + key] = value[1]
        result['t' + name + 'c_' + key] = value[2]
      }
    }

    return valid ? result : null
  }

  return { el: el, submit: submit }
}

function createTripletForm(triplets, scales, onSubmit) {
  var el = document.createElement('div')
  el.className = 'TripletForm'
  el.innerHTML = '<h2>Undersökning</h2>'

  var submits = {}

  for (var key in triplets) {
    var triplet = createTriplet(
      key,
      triplets[key][0],
      triplets[key][1],
      triplets[key][2],
      scales
    )

    el.appendChild(triplet.el)
    submits[key] = triplet.submit
  }

  function submit() {
    var valid = true
    var result = {}

    for (var key in submits) {
      var value = submits[key]()
      
      if (value === null)
        valid = false
      else
        Object.assign(result, value)
    }

    return valid ? result : null
  }

  return { el: el, submit: submit }
}

function createRespondentForm() {
  var header = document.createElement('h2')
  header.innerText = 'Bakgrund'

  var sweSelect = document.createElement('select')
  sweSelect.innerHTML =
    '<option value="y">Ja</option>' +
    '<option value="n">Nej</option>'

  var sweEl = document.createElement('div')
  sweEl.class = 'question'
  sweEl.innerHTML = '<div>Är Svenska ditt modersmål?</div>'
  sweEl.appendChild(sweSelect)

  var first_langInput = document.createElement('input')
  first_langInput.type = 'text'

  var first_langEl = document.createElement('div')
  first_langEl.class = 'question'
  first_langEl.innerHTML = '<div>Vilket är ditt modersmål?</div>'
  first_langEl.appendChild(first_langInput)

  var swe_yearsInput = document.createElement('input')
  swe_yearsInput.type = 'number'

  var swe_yearsEl = document.createElement('div')
  swe_yearsEl.class = 'question'
  swe_yearsEl.innerHTML = '<div>Hur många års erfarenhet har du av Svenska?</div>'
  swe_yearsEl.appendChild(swe_yearsInput)

  var news_readSelect = document.createElement('select')
  news_readSelect.innerHTML =
    '<option value="0">Mycket lätt</option>' +
    '<option value="1">Ganska lätt</option>' +
    '<option value="2">Ganska svårt</option>' +
    '<option value="3">Mycket svårt</option>'

  var news_readEl = document.createElement('div')
  news_readEl.class = 'question'
  news_readEl.innerHTML =
    '<div>Hur lätt har du att förstå innehållet i en svensk tidning som ' +
    't.ex. Dagens Nyheter, Svenska Dagbladet eller Aftonbladet?</div>'
  news_readEl.appendChild(news_readSelect)

  var news_listenSelect = document.createElement('select')
  news_listenSelect.innerHTML =
    '<option value="0">Mycket lätt</option>' +
    '<option value="1">Ganska lätt</option>' +
    '<option value="2">Ganska svårt</option>' +
    '<option value="3">Mycket svårt</option>'

  var news_listenEl = document.createElement('div')
  news_listenEl.class = 'question'
  news_listenEl.innerHTML =
    '<div>Hur lätt har du att förstå innehållet i ett svenskt ' +
    'nyhetsreportage på radio eller TV?</div>'
  news_listenEl.appendChild(news_listenSelect)

  var l2El = document.createElement('div')
  l2El.className = 'l2'
  l2El.innerHTML =
    '<h3>Frågor till dig som inte har Svenska som modersmål</h3>'
  l2El.appendChild(first_langEl)
  l2El.appendChild(swe_yearsEl)
  l2El.appendChild(news_readEl)
  l2El.appendChild(news_listenEl)

  var el = document.createElement('respondent')
  el.className = 'RespondentForm'
  el.appendChild(header)
  el.appendChild(sweEl)
  el.appendChild(l2El)

  function submit () {
    var isL2 = sweSelect.value === 'n'
    return {
      swe: sweSelect.value,
      first_lang: isL2 ? first_langInput.value : '',
      swe_years: isL2 ? swe_yearsInput.value : '',
      news_read: isL2 ? news_readSelect.value : '',
      news_listen: isL2 ? news_listenSelect.value : ''
    }
  }

  return { el: el, submit: submit }
}

function createForm(triplets, scales, onSubmit) {
  var respondentForm = createRespondentForm()
  var tripletForm = createTripletForm(triplets, scales)

  var button = document.createElement('button')
  button.type = 'button'
  button.innerText = 'Skicka svar'
  button.onclick = function submit (e) {
    e.preventDefault()

    button.disabled = 'disabled'

    function enableButton () {
      button.disabled = ''
    }

    var result = tripletForm.submit()
    if (result === null) {
      alert(
        'Något fält är inte korrrekt ifyllt! Var vänlig att kontrollera dina ' +
        'svar.'
      )
      return
    }

    Object.assign(result, respondentForm.submit())

    onSubmit(result, enableButton)
  }


  var el = document.createElement('div')
  el.className = 'form'
  el.appendChild(respondentForm.el)
  el.appendChild(tripletForm.el)
  el.appendChild(button)

  return el
}

var scales = {
  ls: { left: 'långsam', right: 'snabb' },
  pa: { left: 'privat', right: 'allmän' },
  np: { left: 'negativ', right: 'positiv' },
  df: { left: 'dåtid', right: 'framtid' }
}

var triplets = {
  1: ['omtyckt', 'folklig', 'populär'],
  //2: ['gäng', 'grupp', 'sällskap'],
  //3: ['resa', 'färd', 'tur'],
  //4: ['glädje', 'lycka', 'nöje'],
  //5: ['kränkt', 'förolämpad', 'stött']
}

var formURL = 'https://script.google.com/macros/s/AKfycbwurCIztXn9di-eX5XvjJKJ2fqaxKNsa5w2aGzjx-KN3JHw_ts/exec'

function init() {
  var formContainer = document.getElementById('formContainer')

  formContainer.appendChild(
    createForm(triplets, scales, function (result, enableButton) {
      //console.log(result)
      //window.r = result

      var params = ['id=' + encodeURIComponent(window.location.hash.substr(1))];
      for (var key in result) {
        params.push(key + '=' + encodeURIComponent(result[key]))
      }

      fetch(formURL + '?' + params.join('&')).then(function () {
        alert(
          'Tack för att du deltagit i vår undersökning! Du kan nu stänga sidan.'
        )
      }).catch(function () {
        enableButton()
        alert(
          'Ett okänt fel har uppstått, var vänlig att försöka igen om en liten ' +
          'stund.'
        )
      })
    })
  )
}