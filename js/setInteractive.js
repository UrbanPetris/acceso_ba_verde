// L.Layer.prototype.setInteractive = function (interactive) {
//   if (this.getLayers) {
//     this.getLayers().forEach((layer) => {
//       layer.setInteractive(interactive);
//     });
//     return;
//   }
//   if (!this._path) {
//     return;
//   }

//   this.options.interactive = interactive;

//   if (interactive) {
//     L.DomUtil.addClass(this._path, "leaflet-interactive");
//   } else {
//     L.DomUtil.removeClass(this._path, "leaflet-interactive");
//   }
// };

L.Layer.include({
  setInteractive: function (interactive) {
    if (this.getLayers) {
      this.getLayers().forEach((layer) => {
        layer.setInteractive(interactive);
      });
      return;
    }

    if (interactive) {
      L.DomUtil.addClass(this.getElement(), "leaflet-interactive");
    } else {
      L.DomUtil.removeClass(this.getElement(), "leaflet-interactive");
    }
  },
});
