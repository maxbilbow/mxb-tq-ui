<li id="question-{{id}}" class="questionListItem" id="question-{{attributes.id}}" data-url="question/{{attributes.id}}"
    data-answer-count="{{attributes.answerCount}}" data-resolution-id="{{attributes.resolutionId}}">
    <div class="questionListItem__title">{{attributes.title | html}}</div>
    <div class="questionListItem__summary">{{attributes.summary | html}}</div>
    <div class="questionListItem__status">
        <i class="lar la-comments hasAnswersIcon"></i>
        <i class="las la-comment-slash noAnswersIcon"></i>
        <i class="las la-check isResolvedIcon"></i>
        <span class="questionListItem__answerCount">{{attributes.answerCount}}</span>
    </div>

    <div class="postMeta">
        <span class="postMeta__author">By {{attributes.author}}, {{attributes.created | date}}</span>
        <span class="postMeta__location">{{attributes.location.displayName}}</span>
    </div>
</li>