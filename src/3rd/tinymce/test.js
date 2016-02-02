/**
 * 文件描述
 * @author ydr.me
 * @create 2016-02-01 18:05
 */


'use strict';

var arr = ["tinymce/ui/Layout", "tinymce/ui/AbsoluteLayout", "tinymce/ui/Button", "tinymce/ui/ButtonGroup",
    "tinymce/ui/Checkbox", "tinymce/ui/ComboBox", "tinymce/ui/ColorBox", "tinymce/ui/PanelButton",
    "tinymce/ui/ColorButton", "tinymce/util/Color", "tinymce/ui/ColorPicker", "tinymce/ui/Path",
    "tinymce/ui/ElementPath", "tinymce/ui/FormItem", "tinymce/ui/Form", "tinymce/ui/FieldSet",
    "tinymce/ui/FilePicker", "tinymce/ui/FitLayout", "tinymce/ui/FlexLayout", "tinymce/ui/FlowLayout",
    "tinymce/ui/FormatControls", "tinymce/ui/GridLayout", "tinymce/ui/Iframe", "tinymce/ui/Label",
    "tinymce/ui/Toolbar", "tinymce/ui/MenuBar", "tinymce/ui/MenuButton",
    "tinymce/ui/MenuItem", "tinymce/ui/Menu", "tinymce/ui/ListBox", "tinymce/ui/Radio",
    "tinymce/ui/ResizeHandle", "tinymce/ui/SelectBox", "tinymce/ui/Slider", "tinymce/ui/Spacer",
    "tinymce/ui/SplitButton", "tinymce/ui/StackLayout", "tinymce/ui/TabPanel", "tinymce/ui/TextBox",
    "tinymce/ui/Throbber"];

arr.forEach(function (item) {
    var name = item.match(/\/([^/]+)$/)[1];
    // EditorManager.ui.Factory = require('./ui/Factory')(EditorManager);
    console.log("EditorManager.ui." + name + " = require('./ui/" + name + "')(EditorManager);");
});


