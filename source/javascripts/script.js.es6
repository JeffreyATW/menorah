const candles = {
  'candle_1': null,
  'candle_2': null,
  'candle_3': null,
  'candle_4': null,
  'candle_5': null,
  'candle_6': null,
  'candle_7': null,
  'candle_8': null,
  'shamash': null
}

const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;

class Candle {
  constructor(number) {
    this.number = number;
    this.wick = new Wick(this);
    this.element = $('<div class="candle">');
    this.element.append(this.wick.element);
    this.position = 0;
    
    if (this.number === 0) {
      this.id = 'shamash';
      this.container = '#branch_middle';
      const candle = this;
      candle.element.draggable({
        revert: true,
        revertDuration: 500,
        start: function (event, ui) {
          candle.position = ui.position.left;
        },
        drag: function (event, ui) {
          let rotate = ((ui.position.left + candle.position) / 300) * 45;
          // if rotate is more than 45 either way,
          // stop at either negative or positive 45
          // else keep rotate as is
          rotate = Math.abs(rotate) > 45 ? 45 * (rotate / Math.abs(rotate)) : rotate

          $(this).css('transform', `rotate(${rotate}deg)`);

          if (candle.wick.lit) {
            for (i in candles) {
              if (candles[i] !== null && i !== "shamash") {
                if (!candles[i].wick.lit) {
                  candles[i].wick.listen(candle.wick.getActualOffset());
                }
              }
            }
          }
        },
        stop: function (event, ui) {
          candle.element.css('transform', 'rotate(0)');
        }
      });
      $(document).mouseup(() => {
        candle.element.animate({
          rotate: '0deg'
        }, {duration: 500, queue: false});
      });
      candle.element.click(() => {
        candle.wick.light();
      });
    } else {
      let container_number;
      this.id = `candle_${number}`;
      // first four candles go on the right.
      if (this.number > 4) {
        container_number = 9 - this.number;
      } else {
        container_number = this.number;
        this.element.addClass('right');
      }
      this.container = `#branch_${container_number}`;
    }
    
    candles[this.id] = this;
    
    this.element.attr('id', this.id);

    $(this.container).append(this.element);
    this.element.css('background-color', `hsl(${Math.floor(Math.random() * 360)}, 75%, 75%)`);
    this.zIndex = this.number > 0 ? this.number : 10;
    this.element.css('z-index', this.zIndex);
    this.element.addClass('visible', 500, 'easeInQuad');
  }

  melt() {
    const self = this;
    // life is 1 hour, plus up to an hour.
    const life = Math.floor(3200000 + Math.random() * 3200000);
    self.element.animate({height: 0}, {duration: life, step: (now, tween) => {
      if (!self.element.hasClass('ui-draggable-dragging')) {
        self.element.css('top', tween.now * -1);
      }
    }, complete: () => {
      self.element.remove();
    }, queue: false, easing: 'linear'});
  }
}

class Wick {
  constructor(candle) {
    this.candle = candle;
    this.lit = false;
    this.element = $('<div>').addClass('wick');
  }
  
  light() {
    if (!this.lit) {
      this.lit = true;
      this.element.addClass('lit');
      this.burn();
    }
  }

  // We need to correct for Firefox's poor handling of transformed offset.
  // Only do this for shamash - other candles don't rotate.
  getActualOffset() {
    if (isFirefox) {
      return {
        left: this.element.offset().left - this.element.width(),
        top: this.element.offset().top - this.element.height()
      };
    }
    return this.element.offset();
  }

  listen(shamashWickOffset) {
    if (Math.abs(this.element.offset().left - shamashWickOffset.left) < 15 &&
        Math.abs(this.element.offset().top - shamashWickOffset.top) < 15) {
      this.light();
    }
  }

  burn() {
    const self = this;
    const burnination = function () {
      const div = document.createElement('div');
      div.className = 'flame';
      div.setAttribute('style', `z-index: ${self.candle.zIndex}; transform: scale(${Math.random() / 2.5 + .80});`);
      const flame = $(div);
      flame.offset(self.getActualOffset());
      document.body.appendChild(div);
      flame.animate(
        {
          scale: "0",
          top: "-=50px",
          opacity: ".5"
        },
        {
          complete: function () {
            this.parentNode.removeChild(this);
          },
          duration: 250,
          easing: 'easeInQuad'
        }
      );
      if (document.contains(self.element[0])) {
        window.requestAnimationFrame(burnination);
      }
    };
    window.requestAnimationFrame(burnination);
    setTimeout(() => {
      self.candle.melt();
    }, 600);
  }
}

const getDay = function (day, dateObj, month, start, end) {
  if (dateObj.getMonth() === month && dateObj.getDate() >= start && dateObj.getDate() < end) {
    day = dateObj.getDate() - start;
    if (dateObj.getHours() > 12) day++;
  }
  return day;
}

const shamash = new Candle(0);

const dateObj = new Date();
// start day as 8
let day = 8;
switch (dateObj.getFullYear()) {
  case 2010:
    day = getDay(day, dateObj, 11, 1, 9);
    break;
  case 2011:
    day = getDay(day, dateObj, 11, 20, 28);
    break;
  case 2012:
    day = getDay(day, dateObj, 11, 8, 16);
    break;
  case 2013:
    day = getDay(day, dateObj, 10, 27, 31);
    day = getDay(day, dateObj, 11, -3, 5);
    break;
  case 2014:
    day = getDay(day, dateObj, 11, 16, 24);
    break;
  case 2015:
    day = getDay(day, dateObj, 11, 6, 14);
    break;
  case 2016:
    day = getDay(day, dateObj, 11, 24, 32);
    break;
  case 2017:
    day = getDay(day, dateObj, 11, 12, 20);
    break;
  case 2018:
    day = getDay(day, dateObj, 11, 2, 10);
    break;
  case 2019:
    day = getDay(day, dateObj, 11, 22, 30);
    break;
  case 2020:
    day = getDay(day, dateObj, 11, 10, 18);
    break;
}
let numCandles = 1;
const candleAppear = setInterval(function () {
  const candle = new Candle(numCandles);
  numCandles++;
  if (numCandles > day) {
    clearInterval(candleAppear);
  }
}, 100);