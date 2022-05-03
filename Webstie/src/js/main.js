(function () {
  const win = window
  const doc = document.documentElement

  doc.classList.remove('no-js')
  doc.classList.add('js')

  // Reveal animations
  if (document.body.classList.contains('has-animations')) {
    /* global ScrollReveal */
    const sr = window.sr = ScrollReveal()

    sr.reveal('.feature', {
      duration: 600,
      distance: '20px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'right',
      interval: 100
    })

    sr.reveal('.media-canvas', {
      duration: 600,
      scale: '.95',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      viewFactor: 0.5
    })
  }

  // Wait that device mockup has loaded before displaying
  const deviceMockup = document.querySelector('.device-mockup')

  function deviceMockupLoaded () {
    deviceMockup.classList.add('has-loaded')
  }

  if (deviceMockup.complete) {
    deviceMockupLoaded()
  } else {
    deviceMockup.addEventListener('load', deviceMockupLoaded)
  }

  // Features title adjustment
  const featuresSection = document.querySelector('.features')
  const featuresTitle = featuresSection.querySelector('.section-title')
  const firstFeature = document.querySelector('.feature-inner')

  featuresTitlePos()
  win.addEventListener('resize', featuresTitlePos)

  function featuresTitlePos () {
    let featuresSectionLeft = featuresSection.querySelector('.features-inner').getBoundingClientRect().left
    let firstFeatureLeft = firstFeature.getBoundingClientRect().left
    let featuresTitleOffset = parseInt(firstFeatureLeft - featuresSectionLeft)
    if (firstFeatureLeft > featuresSectionLeft) {
      featuresTitle.style.marginLeft = `${featuresTitleOffset}px`
    } else {
      featuresTitle.style.marginLeft = 0
    }
  }

  // Moving objects
  const movingObjects = document.querySelectorAll('.is-moving-object')

  // Throttling
  function throttle (func, milliseconds) {
    let lastEventTimestamp = null
    let limit = milliseconds

    return (...args) => {
      let now = Date.now()

      if (!lastEventTimestamp || now - lastEventTimestamp >= limit) {
        lastEventTimestamp = now
        func.apply(this, args)
      }
    }
  }

  // Init vars
  let mouseX = 0
  let mouseY = 0
  let scrollY = 0
  let coordinateX = 0
  let coordinateY = 0
  let winW = doc.clientWidth
  let winH = doc.clientHeight

  // Move Objects
  function moveObjects (e, object) {
    mouseX = e.pageX
    mouseY = e.pageY
    scrollY = win.scrollY
    coordinateX = (winW / 2) - mouseX
    coordinateY = (winH / 2) - (mouseY - scrollY)

    for (let i = 0; i < object.length; i++) {
      const translatingFactor = object[i].getAttribute('data-translating-factor') || 20
      const rotatingFactor = object[i].getAttribute('data-rotating-factor') || 20
      const perspective = object[i].getAttribute('data-perspective') || 500
      let tranformProperty = []

      if (object[i].classList.contains('is-translating')) {
        tranformProperty.push('translate(' + coordinateX / translatingFactor + 'px, ' + coordinateY / translatingFactor + 'px)')
      }

      if (object[i].classList.contains('is-rotating')) {
        tranformProperty.push('perspective(' + perspective + 'px) rotateY(' + -coordinateX / rotatingFactor + 'deg) rotateX(' + coordinateY / rotatingFactor + 'deg)')
      }

      if (object[i].classList.contains('is-translating') || object[i].classList.contains('is-rotating')) {
        tranformProperty = tranformProperty.join(' ')

        object[i].style.transform = tranformProperty
        object[i].style.transition = 'transform 1s ease-out'
        object[i].style.transformStyle = 'preserve-3d'
        object[i].style.backfaceVisibility = 'hidden'
      }
    }
  }

  // Call function with throttling
  if (movingObjects) {
    win.addEventListener('mousemove', throttle(
      function (e) {
        moveObjects(e, movingObjects)
      },
      150
    ))
  }
}())
function Egg(){this.eggs=[],this.hooks=[],this.kps=[],this.activeEgg="",this.ignoredKeys=[16],arguments.length&&this.AddCode.apply(this,arguments)}Egg.prototype.__execute=function(a){return"function"==typeof a&&a.call(this)},Egg.prototype.__toCharCodes=function(a){var b={slash:191,up:38,down:40,left:37,right:39,enter:13,space:32,ctrl:17,alt:18,tab:9,esc:27},c=Object.keys(b);"string"==typeof a&&(a=a.split(",").map(function(a){return a.trim()}));var d=a.map(function(a){return a===parseInt(a,10)?a:c.indexOf(a)>-1?b[a]:a.charCodeAt(0)});return d.join(",")},Egg.prototype.AddCode=function(a,b,c){return this.eggs.push({keys:this.__toCharCodes(a),fn:b,metadata:c}),this},Egg.prototype.AddHook=function(a){return this.hooks.push(a),this},Egg.prototype.handleEvent=function(a){var b=a.which,c=b>=65&&90>=b;if(!("keydown"!==a.type||a.metaKey||a.ctrlKey||a.altKey||a.shiftKey)){var d=a.target.tagName;if(("HTML"===d||"BODY"===d)&&c)return void a.preventDefault()}"keyup"===a.type&&this.eggs.length>0&&(c&&(a.shiftKey||(b+=32)),-1===this.ignoredKeys.indexOf(b)&&this.kps.push(b),this.eggs.forEach(function(a,b){var c=this.kps.toString().indexOf(a.keys)>=0;c&&(this.kps=[],this.activeEgg=a,this.__execute(a.fn,this),this.hooks.forEach(this.__execute,this),this.activeEgg="")},this))},Egg.prototype.Listen=function(){return void 0!==document.addEventListener&&(document.addEventListener("keydown",this,!1),document.addEventListener("keyup",this,!1)),this},Egg.prototype.listen=Egg.prototype.Listen,Egg.prototype.addCode=Egg.prototype.AddCode,Egg.prototype.addHook=Egg.prototype.AddHook;
