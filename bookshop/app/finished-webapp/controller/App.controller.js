sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter"
], function (Controller, MessageToast, Dialog, Button, Text, Filter, FilterOperator, formatter) {
    "use strict"
    return Controller.extend("sap.codejam.controller.App", {
        formatter: formatter,
        onAfterRendering: function () {
            this.getView().byId("orderBtn").setEnabled(false)
        },
        onSelect: function (oEvent) {
            const oSource = oEvent.getSource()
            const contextPath = oSource.getBindingContextPath()
            const form = this.getView().byId("bookDetails")
            form.bindObject(contextPath)
        },
        onSubmitOrder: function (oEvent) {
            const oBindingContext = this.getView().byId("bookDetails").getBindingContext()
            const selectedBookID = oBindingContext.getProperty("ID")
            const selectedBookTitle = oBindingContext.getProperty("title")
            const inputValue = this.getView().byId("stepInput").getValue()

            const oModel = this.getView().getModel()
			const oAction = oModel.bindContext("/submitOrder(...)")
            oAction.setParameter("book", selectedBookID)
            oAction.setParameter("quantity", inputValue)

            const i18nModel = this.getView().getModel("i18n")

            oAction.execute().then(
                function () {
                    oModel.refresh()
                    const oText = `${i18nModel.getProperty("orderSuccessful")} (${selectedBookTitle}, ${inputValue} ${i18nModel.getProperty("pieces")})`
                    MessageToast.show(oText)
                },
                function (oError) {
                    this.oErrorMessageDialog = new Dialog({
                        type: "Standard",
                        title: i18nModel.getProperty("Error"),
                        state: "Error",
                        content: new Text({ text: oError.error.message })
                        .addStyleClass("sapUiTinyMargin"),
                        beginButton: new Button({
                            text: i18nModel.getProperty("Close"),
                            press: function () {
                                this.oErrorMessageDialog.close()
                            }.bind(this)
                        })
                    })
                    this.oErrorMessageDialog.open();
                }.bind(this)
            )
        },
        onSearch: function (oEvent) {
            const aFilter = []
            const sQuery = oEvent.getParameter("newValue")
            if (sQuery) {
                aFilter.push(new Filter("title", FilterOperator.Contains, sQuery))
            }
            const oList = this.byId("booksTable")
            const oBinding = oList.getBinding("items")
            oBinding.filter(aFilter)
        }
    })
})