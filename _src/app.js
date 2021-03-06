
var currentlyDisplayedPeople = {},
    peopleData = [],
    peopleToShowArray = [];

function checkPeople(){

    // Loop through all the relationships and add the people in them to the peopleData array (if they're not already in it).
    for(var i = 0; i < linksData.length; i++){
        var peopleInLink = linksData[i].people;
        for(var a = 0; a < peopleInLink.length; a++){
            var name = peopleInLink[a];
            // console.log(name);
            // If they aren't already in it...
            if( peopleData.indexOf(name) == -1 ){
                // ...add this person to the peopleData array.
                peopleData.push(name);
            }

        }
    }

}

checkPeople();
console.log(peopleData);


// Function. Helper
// Convert camelCase to spaced
function camelToSpace(str) {
    // split by ' ' at the uppercase letter
    var split = str.replace(/\W+/g, ' ').replace(/([a-z\d])([A-Z])/g, '$1 $2');
    // Return with the first letter uppercase also
    return split.charAt(0).toUpperCase() + split.slice(1);
}


// Function to render the given 'name' as a new card in the page
function renderNewPerson(name, linkedFrom) {

    // console.log("Clicked: "+name);

    // add the clicked person to the peopleToShowArray array,
    var object = {person: name, link: linkedFrom};
    peopleToShowArray.push(object);

    // Rebuild the page with the new peopleToShowArray values
    ReactDOM.render(
        <OutputPage />,
        document.getElementById('page')
    );
};

// Function to check if a person is already on the page
function alreadyOnPage(personToCheck) {

    for( var i = 0; i < peopleToShowArray.length; i++){
        if( peopleToShowArray[i].person == personToCheck){
            // console.log(personToCheck + " is already on the page.");
            return true;
        }
    }

}



var OutputPage = React.createClass({

    clickEvent: function() {
        console.log('clicked reset');
        ReactDOM.render(
            <InitialState />,
            document.getElementById('page')
        );
    },

    render: function() {

        // Loop through the peopleToShowArray array and add the output of each person we need to output
        var peopleList = [];
        var lastPerson;
        for(var i = 0; i < peopleToShowArray.length; i++){

            lastPerson = peopleToShowArray[i].person;
            var key = "from-"+peopleToShowArray[i].link+"-to-"+peopleToShowArray[i].person;

            peopleList.push(<div className="row row--artist">< OutputLink linkedFrom={peopleToShowArray[i].link} linkedTo={peopleToShowArray[i].person} /><OutputPerson key={key} name={peopleToShowArray[i].person} linkedFrom={peopleToShowArray[i].link}/></div>);
        }
        // console.log(lastPerson);

        // Output everyone in the 'peopleList' array and the links to the 'lastPerson'
        return (
            <main>
                {peopleList}
                < OutputLinkOptions linkedFrom={lastPerson}/>
                <div className="connections-counter"><span>{peopleToShowArray.length - 1}</span> Connections <button onClick={this.clickEvent.bind()} >Start Again</button></div>
            </main>
        );
    }
});




// Component: output a person card
var OutputPerson = React.createClass({

    getInitialState: function() {
        return {
            description: '',
            name: ''
        };
    },

    componentDidMount: function() {
        var person = String(this.props.name);

        // Run the call to wikipedia api and set the Reat component state with its response
        wikiData(person, function(wikiDataResponse){
            this.setState({
                description: wikiDataResponse.description,
                name: wikiDataResponse.name
            });
        }.bind(this));

    },

    render: function() {

        // the name passed to this function
        var person = String(this.props.name);
        var linkedFrom = this.props.linkedFrom;
        // console.log(person);

        return (
                <article className="artist">
                    <div className="artist__image">
                        <img src="" />
                    </div>
                    <div className="artist__text">
                        <h1>{this.state.name}</h1>
                        <p>{this.state.description}</p>
                    </div>
                </article>
        );
    }
});


// Component: link. The line that connects two artists
var OutputLink = React.createClass({

    render: function() {
        var linkedFrom = this.props.linkedFrom;
        var linkedTo = this.props.linkedTo;
        var linkDescription;
        for(var i = 0; i < linksData.length; i++){

            var peopleInLink = linksData[i].people;
            // console.log(peopleInLink);

            // Check if the two people we are linking are in this array
            if( peopleInLink.indexOf(linkedFrom) != -1 && peopleInLink.indexOf(linkedTo) != -1){
                // console.log("we have a link");

                linkDescription = linksData[i].description;
            }

        }

        return <div className="link"><div className="link__content">{linkDescription}</div></div>;
    }
});


// Component: link options
var OutputLinkOptions = React.createClass({

    // Render a new person when one of the link options is clicked
    clickEvent: function(linkingTo, linkedFrom) {
        renderNewPerson(linkingTo, linkedFrom)
    },

    render: function() {

        // Get the person we want to find links for
        var linkedFrom = this.props.linkedFrom;
        var links = [];
        // console.log(linksData.length);

        // Loop through all the relationships in relationships.json / linksData array
        for(var i = 0; i < linksData.length; i++){

            var peopleInLink = linksData[i].people;
            // console.log(peopleInLink);

            // Check if the person whos card we are building is in this entry of the json
            if( peopleInLink.indexOf(linkedFrom) != -1 ){
                // console.log("we have a link");

                // Loop through all the names in that link / json entry
                for (var a = 0; a < peopleInLink.length; a++) {
                    // the person we're linking too
                    var linkingTo = peopleInLink[a];
                    var itemClass = "link-choices__item";

                    // Don't output the person as a link to themselves OR if they are already on the page
                    if( linkingTo != linkedFrom ){

                        // Note: the onClick may look a bit odd, really its just `onClick="renderNewPerson(name)"`. See http://stackoverflow.com/a/20446806/3098555
                        var clickEvent = this.clickEvent.bind(null, linkingTo, linkedFrom);

                        // Check the 'peopleToShowArray' to see if that person is already on the page. Remove the click to add person and add a modifier class for the css
                        if( alreadyOnPage(linkingTo) ){
                            clickEvent = "";
                            itemClass += " link-choices__item--disabled";
                        };

                        var key = a + "-link-to-" + linkingTo + "-from-" + linkedFrom;

                        // Add the markup
                        links.push(<li key={key} onClick={clickEvent} className={itemClass}><p>{camelToSpace(linkingTo)}</p><img src=""/></li>);
                    }
                }
            }

        }
        // console.log(links);

        return <section className="row row--links"><h1>Choose A Link</h1><ul className="link-choices">{links}</ul></section>
    }
})


//
// Initial page setup

function buildPage(){
    ReactDOM.render(
        <InitialState />,
        document.getElementById('page')
    );
}

buildPage();
