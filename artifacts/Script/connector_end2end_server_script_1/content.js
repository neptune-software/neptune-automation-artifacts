let fieldCatalog = [];

fieldCatalog.push({ name: "UI5_NAME", label: "Name", type: "string" });
fieldCatalog.push({ name: "id", label: "id", type: "string" });
fieldCatalog.push({ name: "createdAt", label: "Created At", type: "string" });
fieldCatalog.push({ name: "updatedAt", label: "Updated At", type: "string" });
fieldCatalog.push({ name: "createdBy", label: "Created By", type: "string" });
fieldCatalog.push({ name: "updatedBy", label: "Updated By", type: "string" });

result.data = fieldCatalog;
complete();