<section>
    <form id="edit-question-form">
        <div class="edit-question-title">
            <label for="title">Title: <input name="title" value="{{attributes.title}}" required maxlength="50"></input>
            </label>
        </div>

        <faq-textarea id="edit-question-summary" label="Summary:" name="summary" required maxlength="200">
            {{attributes.summary}}
        </faq-textarea>

        <faq-image-picker id="edit-question-image" current-src="{{attributes.imageUrl}}" name="image"
            label="Upload an image">
        </faq-image-picker>

        <faq-textarea id="edit-question-body" label="Question:" name="body" required>
            {{attributes.body.text | html}}
        </faq-textarea>

        <div id="edit-question-actions" class="formActions">
            <input class="formActions__cancel" name="cancel" type="button" value="Cancel" />
            <input class="formActions__submit" type="submit" value="Save" />
        </div>
    </form>
</section>