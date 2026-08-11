neptune.Shell.attachBeforeDisplay((data) => {
  sap.m.MessageToast.show("BeforeDisplay is triggered...")
});

if (sap.n) {
  sap.n.Shell.attachBeforeClose(function (oEvent) {
    sap.m.MessageToast.show("BeforeClose is triggered...")
  });
}