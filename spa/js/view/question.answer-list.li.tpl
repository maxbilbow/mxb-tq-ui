<li class="answerListItem" id="answer-{{id}}" data-id="{{id}}">
    <div class="answerListItem__status"><i class="las la-comment"></i></div>
    <div class="answerListItem__body faqMarkdownBody">
        {{attributes.body.html}}
    </div>
    <div class="postMeta">
        <span class="postMeta__author">By {{attributes.author}}, {{attributes.created | date}}</span>
        <span class="postMeta__location">{{attributes.location.displayName}}</span>
    </div>
</li>