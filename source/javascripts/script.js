import jQuery from "jquery";
import { HebrewCalendar } from "@hebcal/core";

window.jQuery = jQuery;
window.$ = jQuery;

require("../vendor/jquery-ui");
require("./jquery.ui.touch-punch");

const candles = {
  candle_1: null,
  candle_2: null,
  candle_3: null,
  candle_4: null,
  candle_5: null,
  candle_6: null,
  candle_7: null,
  candle_8: null,
  shamash: null,
};

const isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;

class Candle {
  constructor(number) {
    const candle = this;
    candle.number = number;
    candle.wick = new Wick(candle);
    candle.element = $('<div class="candle">');
    candle.element.append(candle.wick.element);
    candle.position = 0;

    if (candle.number === 0) {
      candle.id = "shamash";
      candle.container = "#branch_middle";
      candle.element.draggable({
        revert: true,
        revertDuration: 500,
        start: function (event, ui) {
          candle.position = ui.position.left;
          candle.dragging = true;
        },
        drag: function (event, ui) {
          let rotate = ((ui.position.left + candle.position) / 300) * 45;
          // if rotate is more than 45 either way,
          // stop at either negative or positive 45
          // else keep rotate as is
          rotate =
            Math.abs(rotate) > 45 ? 45 * (rotate / Math.abs(rotate)) : rotate;

          $(this).css("transform", `rotate(${rotate}deg)`);

          if (candle.wick.lit) {
            for (let i in candles) {
              if (candles[i] !== null && i !== "shamash") {
                if (!candles[i].wick.lit) {
                  candles[i].wick.listen(candle.wick.getActualOffset());
                }
              }
            }
          }
        },
        stop: function (event, ui) {
          candle.element.css("transform", "rotate(0)");
          candle.dragging = false;
        },
      });
      $(document).mouseup(() => {
        candle.element.animate(
          {
            rotate: "0deg",
          },
          { duration: 500, queue: false }
        );
      });
      candle.element.click(() => {
        candle.wick.light();
      });
    } else {
      let container_number;
      candle.id = `candle_${number}`;
      // first four candles go on the right.
      if (candle.number > 4) {
        container_number = 9 - candle.number;
      } else {
        container_number = candle.number;
        candle.element.addClass("right");
      }
      candle.container = `#branch_${container_number}`;
    }

    candles[candle.id] = candle;

    candle.element.attr("id", candle.id);

    $(candle.container).append(candle.element);
    candle.element.css(
      "background-color",
      `hsl(${Math.floor(Math.random() * 360)}, 75%, 75%)`
    );
    candle.zIndex = candle.number > 0 ? candle.number : 10;
    candle.element.css("z-index", candle.zIndex);
    candle.element.addClass("visible", 500, "easeInQuad", function () {
      candle.wick.cachedOffset = candle.wick.element.offset();

      $(window).resize(() => {
        candle.wick.cachedOffset = candle.wick.element.offset();
      });
    });
  }

  melt() {
    const self = this;
    // life is 1 hour, plus up to an hour.
    const life = Math.floor(3200000 + Math.random() * 3200000);
    const initialOffsetTop = self.wick.cachedOffset.top;
    self.element.animate(
      { height: 0 },
      {
        duration: life,
        step: (now, tween) => {
          if (!self.element.hasClass("ui-draggable-dragging")) {
            self.wick.cachedOffset.top = initialOffsetTop + tween.pos;
            self.element.css("top", tween.now * -1);
          }
        },
        complete: () => {
          self.element.remove();
        },
        queue: false,
        easing: "linear",
      }
    );
  }
}

class Wick {
  constructor(candle) {
    this.candle = candle;
    this.lit = false;
    this.element = $("<div>").addClass("wick");
    this.height = this.element.height();
    this.width = this.element.width();
  }

  light() {
    if (!this.lit) {
      this.lit = true;
      this.element.addClass("lit");
      this.burn();
    }
  }

  // We need to correct for Firefox's poor handling of transformed offset.
  // Only do this for shamash - other candles don't rotate.
  getActualOffset() {
    let offset;
    if (this.candle.dragging) {
      offset = this.element.offset();
    } else {
      offset = this.cachedOffset;
    }
    if (isFirefox) {
      return {
        left: offset.left - this.width,
        top: offset.top - this.height,
      };
    }
    return offset;
  }

  listen(shamashWickOffset) {
    const offset = this.element.offset();
    if (
      Math.abs(offset.left - shamashWickOffset.left) < 15 &&
      Math.abs(offset.top - shamashWickOffset.top) < 15
    ) {
      this.light();
    }
  }

  burn() {
    const self = this;
    const burnination = function () {
      const div = document.createElement("div");
      div.className = "flame";
      // add display: block to speed up jQuery animation
      div.setAttribute(
        "style",
        `display: block; z-index: ${self.candle.zIndex}; transform: scale(${
          Math.random() / 2.5 + 0.8
        });`
      );
      const flame = $(div);
      flame.offset(self.getActualOffset());
      document.body.appendChild(div);
      flame.animate(
        {
          scale: "0",
          top: "-=50px",
          opacity: ".5",
        },
        {
          complete: function () {
            this.parentNode.removeChild(this);
          },
          duration: 250,
          easing: "easeInQuad",
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

const shamash = new Candle(0);

const dateObj = new Date();
// add 12 hours so anytime after noon is the next day
dateObj.setTime(dateObj.getTime() + 12 * 60 * 60 * 1000);

// start day as 8
let day = 8;

const holidays = new HebrewCalendar.getHolidaysOnDate(dateObj);

if (holidays.length) {
  holidays.forEach((holiday) => {
    const desc = holiday.desc;
    if (desc.match("Chanukah")) {
      day = holiday.chanukahDay || 8;
    }
  });
}

let numCandles = 1;
const candleAppear = setInterval(function () {
  const candle = new Candle(numCandles);
  numCandles++;
  if (numCandles > day) {
    clearInterval(candleAppear);
  }
}, 100);
