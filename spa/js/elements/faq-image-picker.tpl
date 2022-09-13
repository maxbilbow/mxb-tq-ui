<div class="faqFilePickerPreview">
    <img class="faqFilePickerPreview__image" src="{{currentSrc}}" />
    <button title="Remove" class="faqFilePickerPreview__clearBtn">
        <i class="las la-minus-circle"></i>
    </button>
</div>
<div class="faqFilePicker">
    <label for="{{name}}" class="faqFilePicker__label"><span>{{label}} </span>
        <input class="faqFilePicker__button" type="button" value="Upload Image"
            onclick="document.querySelector('input[name=\'{{name}}\'].faqFilePicker__input').click();" />
        <input class="faqFilePicker__input" type="file" name="{{name}}" accept="image/*" value="d" />
    </label>
</div>