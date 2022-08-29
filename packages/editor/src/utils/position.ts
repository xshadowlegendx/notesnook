type PositionData = {
  x: number;
  y: number;
  actualX: number;
  actualY: number;
  width?: number;
  height?: number;
};

const mousePosition: PositionData = { x: 0, y: 0, actualX: 0, actualY: 0 };
window.addEventListener("mousemove", (e) => {
  const { x, y, actualX, actualY } = getMousePosition(e);
  mousePosition.x = x;
  mousePosition.y = y;
  mousePosition.actualX = actualX;
  mousePosition.actualY = actualY;
});

export type PositionOptions = {
  target?: HTMLElement | "mouse";
  isTargetAbsolute?: boolean;
  location?: "right" | "left" | "below" | "top";
  align?: "center" | "start" | "end";
  yOffset?: number;
  xOffset?: number;
  yAnchor?: HTMLElement;
  parent?: HTMLElement | Element;
};
export function getPosition(
  element: HTMLElement,
  options: PositionOptions
): { top: number; left: number } {
  const {
    target = "mouse",
    isTargetAbsolute = false,
    location = undefined,
    yOffset = 0,
    xOffset = 0,
    align = "start",
    parent = document.body,
    yAnchor
  } = options || {};

  const { x, y, width, height, actualX, actualY } =
    target === "mouse"
      ? mousePosition
      : getElementPosition(target, isTargetAbsolute);

  const elementWidth = element.offsetWidth;
  const elementHeight = element.offsetHeight;

  const windowWidth = parent.clientWidth;
  const windowHeight = parent.clientHeight;

  const position = { top: 0, left: 0 };

  if (windowWidth - actualX < elementWidth) {
    const xDiff = actualX - x;
    position.left = windowWidth - elementWidth;
    position.left -= xDiff;
  } else {
    position.left = x;
  }

  if (width && location === "right") {
    position.left += width;
  } else if (location === "left") position.left -= elementWidth;

  if (actualY + elementHeight > windowHeight) {
    position.top = windowHeight - elementHeight;
  } else {
    position.top = y;
  }

  if (height) {
    if (location === "below") position.top += height;
    else if (location === "top") position.top = y - elementHeight;
  }

  if (width && target !== "mouse" && align === "center" && elementWidth > 0) {
    position.left -= (elementWidth - width) / 2;
  } else if (
    width &&
    target !== "mouse" &&
    align === "end" &&
    elementWidth > 0
  ) {
    position.left -= elementWidth - width;
  }

  // Adjust menu height
  if (elementHeight > windowHeight - position.top) {
    element.style.maxHeight = `${windowHeight - 20}px`;
  }

  if (yAnchor) {
    const anchorY = getElementPosition(yAnchor, isTargetAbsolute);
    position.top = anchorY.y - elementHeight;
  }

  position.top = isTargetAbsolute && position.top < 0 ? 0 : position.top;
  position.left = isTargetAbsolute && position.left < 0 ? 0 : position.left;
  position.top += location === "below" ? yOffset : -yOffset;
  position.left += xOffset;

  return position;
}

function getMousePosition(e: MouseEvent) {
  let posx = 0;
  let posy = 0;

  if (!e && window.event) e = window.event as MouseEvent;

  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } else if (e.clientX || e.clientY) {
    posx =
      e.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    posy =
      e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  return {
    x: posx,
    y: posy,
    actualY: posy,
    actualX: posx
  };
}

export function getElementPosition(
  element: HTMLElement,
  absolute: boolean
): PositionData {
  const rect = element.getBoundingClientRect();
  const position: PositionData = {
    x: element.offsetLeft,
    y: element.offsetTop,
    width: rect.width,
    height: rect.height,
    actualY: rect.y,
    actualX: rect.x
  };
  if (absolute) {
    position.x = position.actualX;
    position.y = position.actualY;
  }

  return position;
}