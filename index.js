
var Controller = $.makeClass({
    init: function(){
	    this.container = $("#Container");
	
    	this.oldData = "";
		this.loadData();
	    this.interval = setInterval(this.loadData.as(this), 20000);
	},
	loadData: function(){
	    this.showLoading();
		$.ajax({
		    type: "GET",
		    url: "data.html",
		    success: function(dataStr){
		    	var data = dataStr.evalJSON();
		
				if(dataStr != this.oldData)
				{
				    this.oldData = dataStr;
    				
			        var questions = data.Questions;
			        var people = data.People;
    				
    				
				    this.SetTotalPoints(questions, people);
    				
			        var html = this.BuildResultsTable(questions, people);
				    this.container.html(html);
    				
				    this.container.find("tr.Responses:even").addClass("Odd");
				    this.container.find("tr.Responses:odd").addClass("Even");
    			}
	            setTimeout(this.hideLoading, 800);
			}.as(this)
		});
	},
	showLoading: function(){
	    $("#LoadingIcon").css("visibility", "visible");
	},
	hideLoading: function(){
	    $("#LoadingIcon").css("visibility", "hidden");
	},
	SetTotalPoints: function(questions, people)
	{
		for(var i=0; i<people.length; i++)
		{
			var person = people[i];
			person.Points = 0;
			
			for(var j=0; j<questions.length; j++){
				var question = questions[j];
				if(question.Answer && question.Answer == person.Answers[j])
				{
					for(var k=0; k<question.Choices.length; k++){
						if(question.Choices[k].Key == question.Answer)
						{
							person.Points += question.Choices[k].Points;
							break;	
						}
					}
				}
			}
		}
		
		//sort
		people.sort(function(p1, p2){
			if(p2.Points != p1.Points)
		    	return p2.Points-p1.Points;
			return p2.Name < p1.Name ? 1 : -1;
		});
	},
	BuildResultsTable: function(questions, people){
		var html = ["<table>",
						"<tr class=Questions>",
							"<td colspan=3 rowspan=2><img src=Logo.gif /></td>"];
		for(var i=0; i<questions.length; i++){
			html.push(		"<td>",questions[i].Title,"</td>");
		}
		html.push( 		"</tr>",
						"<tr class=Answers>");
		for(var i=0; i<questions.length; i++){
			var cls = questions[i].Answer ? "Confirmed" : "Unknown";
			html.push(		"<td class=",cls,">",(questions[i].Answer || "?"),"</td>");
		}
		html.push( 		"</tr>");
		
		for(var i=0; i<people.length; i++){
			var person = people[i];
			html.push(	"<tr class=Responses>",
							"<td class=Rank>",(i+1),"</td>",
							"<td class=Name>",person.Name,"</td>",
							"<td class=Points>",person.Points,"</td>");
			for(var j=0; j<questions.length; j++){
				var cls = "Undecided";
				var question = questions[j];
				if(question.Answer){
					if(question.Answer == person.Answers[j]){
						cls = "Correct";						
					}else{
						cls = "Incorrect";
					}
				}
				var points = 0;
				for(var k=0; k<question.Choices.length; k++)
				{
				    if(question.Choices[k].Key == person.Answers[j])
				    {
				        points = question.Choices[k].Points;
				        break;
				    }
				}
				var dat = person.Answers[j] ? (person.Answers[j]+"<span class=Value><br />"+points+"</span>") : "";
				html.push(	"<td class='Response ",cls," '>",dat,"</td>");
			}
			html.push( 	"</tr>");
		}
		
		html.push( 	"</table>");
		
		return html.join('');
	}
});