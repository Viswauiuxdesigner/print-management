/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as ReactTypes from "react";

declare global {
  namespace JSX {
    interface Element extends ReactTypes.ReactElement<any, any> {}
    interface ElementClass extends ReactTypes.Component<any> {
      render(): ReactTypes.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicAttributes {
      key?: string | number | null;
      className?: string;
    }

    interface IntrinsicClassAttributes<T> {
      ref?: ReactTypes.Ref<T>;
    }

    interface DOMAttributes<T> {
      children?: ReactTypes.ReactNode;
      dangerouslySetInnerHTML?: {
        __html: string;
      };
      // Clipboard Events
      onCopy?: ReactTypes.ClipboardEventHandler<T>;
      onCopyCapture?: ReactTypes.ClipboardEventHandler<T>;
      onCut?: ReactTypes.ClipboardEventHandler<T>;
      onCutCapture?: ReactTypes.ClipboardEventHandler<T>;
      onPaste?: ReactTypes.ClipboardEventHandler<T>;
      onPasteCapture?: ReactTypes.ClipboardEventHandler<T>;

      // Composition Events
      onCompositionEnd?: ReactTypes.CompositionEventHandler<T>;
      onCompositionEndCapture?: ReactTypes.CompositionEventHandler<T>;
      onCompositionStart?: ReactTypes.CompositionEventHandler<T>;
      onCompositionStartCapture?: ReactTypes.CompositionEventHandler<T>;
      onCompositionUpdate?: ReactTypes.CompositionEventHandler<T>;
      onCompositionUpdateCapture?: ReactTypes.CompositionEventHandler<T>;

      // Focus Events
      onFocus?: ReactTypes.FocusEventHandler<T>;
      onFocusCapture?: ReactTypes.FocusEventHandler<T>;
      onBlur?: ReactTypes.FocusEventHandler<T>;
      onBlurCapture?: ReactTypes.FocusEventHandler<T>;

      // Form Events
      onChange?: ReactTypes.FormEventHandler<T>;
      onChangeCapture?: ReactTypes.FormEventHandler<T>;
      onBeforeInput?: ReactTypes.FormEventHandler<T>;
      onBeforeInputCapture?: ReactTypes.FormEventHandler<T>;
      onInput?: ReactTypes.FormEventHandler<T>;
      onInputCapture?: ReactTypes.FormEventHandler<T>;
      onReset?: ReactTypes.FormEventHandler<T>;
      onResetCapture?: ReactTypes.FormEventHandler<T>;
      onSubmit?: ReactTypes.FormEventHandler<T>;
      onSubmitCapture?: ReactTypes.FormEventHandler<T>;
      onInvalid?: ReactTypes.FormEventHandler<T>;
      onInvalidCapture?: ReactTypes.FormEventHandler<T>;

      // Image Events
      onLoad?: ReactTypes.ReactEventHandler<T>;
      onLoadCapture?: ReactTypes.ReactEventHandler<T>;
      onError?: ReactTypes.ReactEventHandler<T>;
      onErrorCapture?: ReactTypes.ReactEventHandler<T>;

      // Keyboard Events
      onKeyDown?: ReactTypes.KeyboardEventHandler<T>;
      onKeyDownCapture?: ReactTypes.KeyboardEventHandler<T>;
      onKeyPress?: ReactTypes.KeyboardEventHandler<T>;
      onKeyPressCapture?: ReactTypes.KeyboardEventHandler<T>;
      onKeyUp?: ReactTypes.KeyboardEventHandler<T>;
      onKeyUpCapture?: ReactTypes.KeyboardEventHandler<T>;

      // MouseEvents
      onAuxClick?: ReactTypes.MouseEventHandler<T>;
      onAuxClickCapture?: ReactTypes.MouseEventHandler<T>;
      onClick?: ReactTypes.MouseEventHandler<T>;
      onClickCapture?: ReactTypes.MouseEventHandler<T>;
      onContextMenu?: ReactTypes.MouseEventHandler<T>;
      onContextMenuCapture?: ReactTypes.MouseEventHandler<T>;
      onDoubleClick?: ReactTypes.MouseEventHandler<T>;
      onDoubleClickCapture?: ReactTypes.MouseEventHandler<T>;
      onDrag?: ReactTypes.DragEventHandler<T>;
      onDragCapture?: ReactTypes.DragEventHandler<T>;
      onDragEnd?: ReactTypes.DragEventHandler<T>;
      onDragEndCapture?: ReactTypes.DragEventHandler<T>;
      onDragEnter?: ReactTypes.DragEventHandler<T>;
      onDragEnterCapture?: ReactTypes.DragEventHandler<T>;
      onDragExit?: ReactTypes.DragEventHandler<T>;
      onDragExitCapture?: ReactTypes.DragEventHandler<T>;
      onDragLeave?: ReactTypes.DragEventHandler<T>;
      onDragLeaveCapture?: ReactTypes.DragEventHandler<T>;
      onDragOver?: ReactTypes.DragEventHandler<T>;
      onDragOverCapture?: ReactTypes.DragEventHandler<T>;
      onDragStart?: ReactTypes.DragEventHandler<T>;
      onDragStartCapture?: ReactTypes.DragEventHandler<T>;
      onDrop?: ReactTypes.DragEventHandler<T>;
      onDropCapture?: ReactTypes.DragEventHandler<T>;
      onMouseDown?: ReactTypes.MouseEventHandler<T>;
      onMouseDownCapture?: ReactTypes.MouseEventHandler<T>;
      onMouseEnter?: ReactTypes.MouseEventHandler<T>;
      onMouseLeave?: ReactTypes.MouseEventHandler<T>;
      onMouseMove?: ReactTypes.MouseEventHandler<T>;
      onMouseMoveCapture?: ReactTypes.MouseEventHandler<T>;
      onMouseOut?: ReactTypes.MouseEventHandler<T>;
      onMouseOutCapture?: ReactTypes.MouseEventHandler<T>;
      onMouseOver?: ReactTypes.MouseEventHandler<T>;
      onMouseOverCapture?: ReactTypes.MouseEventHandler<T>;
      onMouseUp?: ReactTypes.MouseEventHandler<T>;
      onMouseUpCapture?: ReactTypes.MouseEventHandler<T>;

      // Selection Events
      onSelect?: ReactTypes.ReactEventHandler<T>;
      onSelectCapture?: ReactTypes.ReactEventHandler<T>;

      // Touch Events
      onTouchCancel?: ReactTypes.TouchEventHandler<T>;
      onTouchCancelCapture?: ReactTypes.TouchEventHandler<T>;
      onTouchEnd?: ReactTypes.TouchEventHandler<T>;
      onTouchEndCapture?: ReactTypes.TouchEventHandler<T>;
      onTouchMove?: ReactTypes.TouchEventHandler<T>;
      onTouchMoveCapture?: ReactTypes.TouchEventHandler<T>;
      onTouchStart?: ReactTypes.TouchEventHandler<T>;
      onTouchStartCapture?: ReactTypes.TouchEventHandler<T>;

      // Pointer Events
      onPointerDown?: ReactTypes.PointerEventHandler<T>;
      onPointerDownCapture?: ReactTypes.PointerEventHandler<T>;
      onPointerMove?: ReactTypes.PointerEventHandler<T>;
      onPointerMoveCapture?: ReactTypes.PointerEventHandler<T>;
      onPointerUp?: ReactTypes.PointerEventHandler<T>;
      onPointerUpCapture?: ReactTypes.PointerEventHandler<T>;
      onPointerCancel?: ReactTypes.PointerEventHandler<T>;
      onPointerCancelCapture?: ReactTypes.PointerEventHandler<T>;
      onPointerEnter?: ReactTypes.PointerEventHandler<T>;
      onPointerLeave?: ReactTypes.PointerEventHandler<T>;
      onPointerOver?: ReactTypes.PointerEventHandler<T>;
      onPointerOverCapture?: ReactTypes.PointerEventHandler<T>;
      onPointerOut?: ReactTypes.PointerEventHandler<T>;
      onPointerOutCapture?: ReactTypes.PointerEventHandler<T>;
      onGotPointerCapture?: ReactTypes.PointerEventHandler<T>;
      onGotPointerCaptureCapture?: ReactTypes.PointerEventHandler<T>;
      onLostPointerCapture?: ReactTypes.PointerEventHandler<T>;
      onLostPointerCaptureCapture?: ReactTypes.PointerEventHandler<T>;

      // Scroll Events
      onScroll?: ReactTypes.UIEventHandler<T>;
      onScrollCapture?: ReactTypes.UIEventHandler<T>;

      // Wheel Events
      onWheel?: ReactTypes.WheelEventHandler<T>;
      onWheelCapture?: ReactTypes.WheelEventHandler<T>;

      // Animation Events
      onAnimationStart?: ReactTypes.AnimationEventHandler<T>;
      onAnimationStartCapture?: ReactTypes.AnimationEventHandler<T>;
      onAnimationEnd?: ReactTypes.AnimationEventHandler<T>;
      onAnimationEndCapture?: ReactTypes.AnimationEventHandler<T>;
      onAnimationIteration?: ReactTypes.AnimationEventHandler<T>;
      onAnimationIterationCapture?: ReactTypes.AnimationEventHandler<T>;

      // Transition Events
      onTransitionEnd?: ReactTypes.TransitionEventHandler<T>;
      onTransitionEndCapture?: ReactTypes.TransitionEventHandler<T>;
    }

    interface HTMLAttributes<T> extends DOMAttributes<T> {
      id?: string;
      className?: string;
      style?: ReactTypes.CSSProperties;
      title?: string;
      role?: string;
      tabIndex?: number;
      dir?: string;
      lang?: string;
      hidden?: boolean;
      suppressHydrationWarning?: boolean;
      [attr: string]: any;
    }

    interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
      autoFocus?: boolean;
      disabled?: boolean;
      form?: string;
      formAction?: string;
      formEncType?: string;
      formMethod?: string;
      formNoValidate?: boolean;
      formTarget?: string;
      name?: string;
      type?: "submit" | "reset" | "button";
      value?: string | string[] | number;
    }

    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
      accept?: string;
      alt?: string;
      autoComplete?: string;
      autoFocus?: boolean;
      capture?: boolean | "user" | "environment";
      checked?: boolean;
      crossOrigin?: string;
      disabled?: boolean;
      enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
      form?: string;
      formAction?: string;
      formEncType?: string;
      formMethod?: string;
      formNoValidate?: boolean;
      formTarget?: string;
      height?: number | string;
      list?: string;
      max?: number | string;
      maxLength?: number;
      min?: number | string;
      minLength?: number;
      multiple?: boolean;
      name?: string;
      pattern?: string;
      placeholder?: string;
      readOnly?: boolean;
      required?: boolean;
      size?: number;
      src?: string;
      step?: number | string;
      type?: string;
      value?: string | string[] | number;
      width?: number | string;
    }

    interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
      acceptCharset?: string;
      action?: string | ((formData: FormData) => void | Promise<void>);
      autoComplete?: string;
      encType?: string;
      method?: string;
      name?: string;
      noValidate?: boolean;
      target?: string;
    }

    interface SVGAttributes<T> extends DOMAttributes<T> {
      className?: string;
      color?: string;
      height?: number | string;
      id?: string;
      lang?: string;
      max?: number | string;
      media?: string;
      method?: string;
      min?: number | string;
      name?: string;
      style?: ReactTypes.CSSProperties;
      target?: string;
      type?: string;
      width?: number | string;
      role?: string;
      tabIndex?: number;
      crossOrigin?: "anonymous" | "use-credentials" | "";
      fill?: string;
      fillOpacity?: number | string;
      fillRule?: "nonzero" | "evenodd" | "inherit";
      stroke?: string;
      strokeDasharray?: string | number;
      strokeDashoffset?: string | number;
      strokeLinecap?: "butt" | "round" | "square" | "inherit";
      strokeLinejoin?: "miter" | "round" | "bevel" | "inherit";
      strokeMiterlimit?: number | string;
      strokeOpacity?: number | string;
      strokeWidth?: number | string;
      viewBox?: string;
      xmlns?: string;
      [attr: string]: any;
    }

    interface IntrinsicElements {
      // HTML
      a: HTMLAttributes<HTMLAnchorElement>;
      abbr: HTMLAttributes<HTMLElement>;
      address: HTMLAttributes<HTMLElement>;
      area: HTMLAttributes<HTMLAreaElement>;
      article: HTMLAttributes<HTMLElement>;
      aside: HTMLAttributes<HTMLElement>;
      audio: HTMLAttributes<HTMLAudioElement>;
      b: HTMLAttributes<HTMLElement>;
      base: HTMLAttributes<HTMLBaseElement>;
      bdi: HTMLAttributes<HTMLElement>;
      bdo: HTMLAttributes<HTMLElement>;
      big: HTMLAttributes<HTMLElement>;
      blockquote: HTMLAttributes<HTMLQuoteElement>;
      body: HTMLAttributes<HTMLBodyElement>;
      br: HTMLAttributes<HTMLBRElement>;
      button: ButtonHTMLAttributes<HTMLButtonElement>;
      canvas: HTMLAttributes<HTMLCanvasElement>;
      caption: HTMLAttributes<HTMLElement>;
      cite: HTMLAttributes<HTMLElement>;
      code: HTMLAttributes<HTMLElement>;
      col: HTMLAttributes<HTMLTableColElement>;
      colgroup: HTMLAttributes<HTMLTableColElement>;
      data: HTMLAttributes<HTMLDataElement>;
      datalist: HTMLAttributes<HTMLDataListElement>;
      dd: HTMLAttributes<HTMLElement>;
      del: HTMLAttributes<HTMLModElement>;
      details: HTMLAttributes<HTMLDetailsElement>;
      dfn: HTMLAttributes<HTMLElement>;
      dialog: HTMLAttributes<HTMLDialogElement>;
      div: HTMLAttributes<HTMLDivElement>;
      dl: HTMLAttributes<HTMLDListElement>;
      dt: HTMLAttributes<HTMLElement>;
      em: HTMLAttributes<HTMLElement>;
      embed: HTMLAttributes<HTMLEmbedElement>;
      fieldset: HTMLAttributes<HTMLFieldSetElement>;
      figcaption: HTMLAttributes<HTMLElement>;
      figure: HTMLAttributes<HTMLElement>;
      footer: HTMLAttributes<HTMLElement>;
      form: FormHTMLAttributes<HTMLFormElement>;
      h1: HTMLAttributes<HTMLHeadingElement>;
      h2: HTMLAttributes<HTMLHeadingElement>;
      h3: HTMLAttributes<HTMLHeadingElement>;
      h4: HTMLAttributes<HTMLHeadingElement>;
      h5: HTMLAttributes<HTMLHeadingElement>;
      h6: HTMLAttributes<HTMLHeadingElement>;
      head: HTMLAttributes<HTMLHeadElement>;
      header: HTMLAttributes<HTMLElement>;
      hgroup: HTMLAttributes<HTMLElement>;
      hr: HTMLAttributes<HTMLHRElement>;
      html: HTMLAttributes<HTMLHtmlElement>;
      i: HTMLAttributes<HTMLElement>;
      iframe: HTMLAttributes<HTMLIFrameElement>;
      img: HTMLAttributes<HTMLImageElement>;
      input: InputHTMLAttributes<HTMLInputElement>;
      ins: HTMLAttributes<HTMLModElement>;
      kbd: HTMLAttributes<HTMLElement>;
      keygen: HTMLAttributes<HTMLElement>;
      label: HTMLAttributes<HTMLLabelElement>;
      legend: HTMLAttributes<HTMLLegendElement>;
      li: HTMLAttributes<HTMLLIElement>;
      link: HTMLAttributes<HTMLLinkElement>;
      main: HTMLAttributes<HTMLElement>;
      map: HTMLAttributes<HTMLMapElement>;
      mark: HTMLAttributes<HTMLElement>;
      menu: HTMLAttributes<HTMLElement>;
      menuitem: HTMLAttributes<HTMLElement>;
      meta: HTMLAttributes<HTMLMetaElement>;
      meter: HTMLAttributes<HTMLMeterElement>;
      nav: HTMLAttributes<HTMLElement>;
      noindex: HTMLAttributes<HTMLElement>;
      noscript: HTMLAttributes<HTMLElement>;
      object: HTMLAttributes<HTMLObjectElement>;
      ol: HTMLAttributes<HTMLOListElement>;
      optgroup: HTMLAttributes<HTMLOptGroupElement>;
      option: HTMLAttributes<HTMLOptionElement>;
      output: HTMLAttributes<HTMLOutputElement>;
      p: HTMLAttributes<HTMLParagraphElement>;
      param: HTMLAttributes<HTMLParamElement>;
      picture: HTMLAttributes<HTMLElement>;
      pre: HTMLAttributes<HTMLPreElement>;
      progress: HTMLAttributes<HTMLProgressElement>;
      q: HTMLAttributes<HTMLQuoteElement>;
      rp: HTMLAttributes<HTMLElement>;
      rt: HTMLAttributes<HTMLElement>;
      ruby: HTMLAttributes<HTMLElement>;
      s: HTMLAttributes<HTMLElement>;
      samp: HTMLAttributes<HTMLElement>;
      slot: HTMLAttributes<HTMLSlotElement>;
      script: HTMLAttributes<HTMLScriptElement>;
      section: HTMLAttributes<HTMLElement>;
      select: HTMLAttributes<HTMLSelectElement>;
      small: HTMLAttributes<HTMLElement>;
      source: HTMLAttributes<HTMLSourceElement>;
      span: HTMLAttributes<HTMLSpanElement>;
      strong: HTMLAttributes<HTMLElement>;
      style: HTMLAttributes<HTMLStyleElement>;
      sub: HTMLAttributes<HTMLElement>;
      summary: HTMLAttributes<HTMLElement>;
      sup: HTMLAttributes<HTMLElement>;
      table: HTMLAttributes<HTMLTableElement>;
      template: HTMLAttributes<HTMLTemplateElement>;
      tbody: HTMLAttributes<HTMLTableSectionElement>;
      td: HTMLAttributes<HTMLTableCellElement>;
      textarea: HTMLAttributes<HTMLTextAreaElement>;
      tfoot: HTMLAttributes<HTMLTableSectionElement>;
      th: HTMLAttributes<HTMLTableCellElement>;
      thead: HTMLAttributes<HTMLTableSectionElement>;
      time: HTMLAttributes<HTMLTimeElement>;
      title: HTMLAttributes<HTMLTitleElement>;
      tr: HTMLAttributes<HTMLTableRowElement>;
      track: HTMLAttributes<HTMLTrackElement>;
      u: HTMLAttributes<HTMLElement>;
      ul: HTMLAttributes<HTMLUListElement>;
      var: HTMLAttributes<HTMLElement>;
      video: HTMLAttributes<HTMLVideoElement>;
      wbr: HTMLAttributes<HTMLElement>;

      // SVG
      svg: SVGAttributes<SVGSVGElement>;
      animate: SVGAttributes<SVGElement>;
      animateMotion: SVGAttributes<SVGElement>;
      animateTransform: SVGAttributes<SVGElement>;
      circle: SVGAttributes<SVGCircleElement>;
      clipPath: SVGAttributes<SVGClipPathElement>;
      defs: SVGAttributes<SVGDefsElement>;
      desc: SVGAttributes<SVGDescElement>;
      ellipse: SVGAttributes<SVGEllipseElement>;
      feBlend: SVGAttributes<SVGFEBlendElement>;
      feColorMatrix: SVGAttributes<SVGFEColorMatrixElement>;
      feComponentTransfer: SVGAttributes<SVGFEComponentTransferElement>;
      feComposite: SVGAttributes<SVGFECompositeElement>;
      feConvolveMatrix: SVGAttributes<SVGFEConvolveMatrixElement>;
      feDiffuseLighting: SVGAttributes<SVGFEDiffuseLightingElement>;
      feDisplacementMap: SVGAttributes<SVGFEDisplacementMapElement>;
      feDistantLight: SVGAttributes<SVGFEDistantLightElement>;
      feDropShadow: SVGAttributes<SVGFEDropShadowElement>;
      feFlood: SVGAttributes<SVGFEFloodElement>;
      feFuncA: SVGAttributes<SVGFEFuncAElement>;
      feFuncB: SVGAttributes<SVGFEFuncBElement>;
      feFuncG: SVGAttributes<SVGFEFuncGElement>;
      feFuncR: SVGAttributes<SVGFEFuncRElement>;
      feGaussianBlur: SVGAttributes<SVGFEGaussianBlurElement>;
      feImage: SVGAttributes<SVGFEImageElement>;
      feMerge: SVGAttributes<SVGFEMergeElement>;
      feMergeNode: SVGAttributes<SVGFEMergeNodeElement>;
      feMorphology: SVGAttributes<SVGFEMorphologyElement>;
      feOffset: SVGAttributes<SVGFEOffsetElement>;
      fePointLight: SVGAttributes<SVGFEPointLightElement>;
      feSpecularLighting: SVGAttributes<SVGFESpecularLightingElement>;
      feSpotLight: SVGAttributes<SVGFESpotLightElement>;
      feTile: SVGAttributes<SVGFETileElement>;
      feTurbulence: SVGAttributes<SVGFETurbulenceElement>;
      filter: SVGAttributes<SVGFilterElement>;
      foreignObject: SVGAttributes<SVGForeignObjectElement>;
      g: SVGAttributes<SVGGElement>;
      image: SVGAttributes<SVGImageElement>;
      line: SVGAttributes<SVGLineElement>;
      linearGradient: SVGAttributes<SVGLinearGradientElement>;
      marker: SVGAttributes<SVGMarkerElement>;
      mask: SVGAttributes<SVGMaskElement>;
      metadata: SVGAttributes<SVGMetadataElement>;
      mpath: SVGAttributes<SVGElement>;
      path: SVGAttributes<SVGPathElement>;
      pattern: SVGAttributes<SVGPatternElement>;
      polygon: SVGAttributes<SVGPolygonElement>;
      polyline: SVGAttributes<SVGPolylineElement>;
      radialGradient: SVGAttributes<SVGRadialGradientElement>;
      rect: SVGAttributes<SVGRectElement>;
      stop: SVGAttributes<SVGStopElement>;
      switch: SVGAttributes<SVGSwitchElement>;
      symbol: SVGAttributes<SVGSymbolElement>;
      text: SVGAttributes<SVGTextElement>;
      textPath: SVGAttributes<SVGTextPathElement>;
      tspan: SVGAttributes<SVGTSpanElement>;
      use: SVGAttributes<SVGUseElement>;
      view: SVGAttributes<SVGViewElement>;

      // Fallback
      [elemName: string]: any;
    }
  }
}

export {};
