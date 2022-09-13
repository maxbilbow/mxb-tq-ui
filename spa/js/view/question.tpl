<section class="question">
    <div id="question-summary">
        <figure class="questionImage">
            <figcaption></figcaption>
            <img src="{{attributes.imageUrl}}" />
        </figure>
    </div>

    <div id="question-body" class="faqMarkdownBody">{{attributes.body.html}}</div>

    <div id="question-actions" class="formActions hidden">
        <button id="edit-question-btn"><i class="las la-pen"></i></button>
        <button id="delete-question-btn"><i class="lar la-trash-alt"></i></button>
    </div>

    <div id="question-meta" class="postMeta">
        <span class="postMeta__author">By {{attributes.author}}, {{attributes.created | date}}</span>
        <span class="postMeta__location">{{attributes.location.displayName}}</span>
    </div>
</section>

<faq-collection id="answer-list" src="/questions/{{id}}/answers" tpl="/js/view/question.answer-list.li.tpl"
    class="question__answerList">
</faq-collection>
<section id="faq-answer" class="hidden">
    <form id="new-answer-form">
        <faq-textarea id="new-answer-text-area" label="Answer:" name="body"></faq-textarea>
        <div class="formActions"><input type="submit" value="Send" /></div>
    </form>
</section>