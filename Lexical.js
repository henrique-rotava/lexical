var Lexical = function(){
	var lexer = this;
	
	this.stateCount = 0;
	this.alphabet = {};
	this.verification = 'execution';
	
	this.startLexical = function(){
		var lex = {};
		var objectStored = this.getLexStorage();
		if(objectStored != null){
			lex = JSON.parse(objectStored);
			
			setStateCount(lex.stateCount);
			setAlphabet(lex.alphabet);
			setVerification(lex.verification);
			
			lex = lex.lexical;
		}else{
			updateLexStorage(lex);
		}
		return lex;
	};
	
	this.getLex = function(){
		return this.lex;
	};
	
	var setLex = function(lex){
		lexer.lex = lex;
	}
	
	this.getAlphabet = function(){
		return this.alphabet;
	};
	
	var setAlphabet = function(alphabet){
		lexer.alphabet = alphabet;
	}
	
	this.getVerification = function(){
		return this.verification;
	};
	
	var setVerification = function(verification){
		lexer.verification = verification;
	}
	
	var addCharToAlphabet = function(symbol){
		lexer.alphabet[symbol] = {};
	}
	
	this.getStateCount = function(){
		return this.stateCount;
	};
	
	var setStateCount = function(stateCount){
		lexer.stateCount = stateCount;
	}
	
	var incrementStateCount = function(){
		return lexer.stateCount++;
	}
	
	var decrementStateCount = function(){
		return lexer.stateCount--;
	}
	
	this.clean = function(){
		setLex(new Object());
		this.cleanLexStorage();
		this.stateCount = 0;
		this.alphabet = {};
		this.verification = 'execution';
	}
	
	this.addWord = function(word){
		word = word.toLowerCase();
		part = '';
		obj = '';
		for(j in word){
			addCharToAlphabet(word[j]);
			part += word[j];
			obj += "['"+word[j] +"']";
			if(this.getObject(part) === undefined){
			
				state = 'q' + incrementStateCount();
				eval(this.lexName + obj + " = {'state': '"+state+"'}");
			}
		}
		
		eval(this.lexName + obj + ".final = true");
		
		updateLexStorage(this.getLex());
	};
	
	this.removeWord = function(word){
		word = word.toLowerCase();
		thisWord = word;
		for(j = word.length-1; j >= 0 ; j--){
			
			if(this.wordExist(thisWord) && !(this.getObject(thisWord).final && word.length-1 != j)){
				if(this.getOptions(thisWord).length == 0){
					obj = this.getObjectString(thisWord);
					deleteProperty(obj);
				}else if(this.getObject(thisWord).final){
					obj = this.getObjectString(thisWord);
					deleteProperty(obj + ".final");
				}
			}else{
				break;
			}
			thisWord = word.substring(0,j);
		}
		this.rebuildStates();
	};
	
	var deleteProperty = function(obj){
		eval("delete lexer.lex" + obj);
	};
	
	this.getObjectString = function(word){
		word = word.toLowerCase();
		var objstr = "";
		for(i = 0; i< word.length; i++){
			objstr += "['"+word[i]+"']";
		}
		return objstr;
	};
	
	this.wordExist = function(word){
		if(this.getObject(word) === undefined){
			return false;
		}
		return true;
	};

	this.isValidWord = function(word){
		if(this.wordExist(word) && this.getObject(word).final){
			return true;
		}else{
			return false
		}
	};
	
	this.isValidSequence = function(word){
		if(this.wordExist(word)){
			return true;
		}else{
			return false
		}
	};
	
	this.getObject = function(word){
		word = word.toLowerCase();
		var object = this.lexName;
		for(i = 0; i< word.length; i++){
			object += "['"+word[i]+"']";
			if(eval(object) === undefined){
				return undefined;
			}
		}
		return eval(object);
	};
	
	this.getOptions = function(word){
		word = word.toLowerCase();
		var options = [];
		obj = this.getObject(word);
		for(var property in obj) {
			if(property != 'final' && property != 'state'){
				options.push(property);
			}
		}
		return options;
	};
	
	this.getWordState = function(word){
		word = word.toLowerCase();
		obj = this.getObject(word);
		return obj['state'];
	};
	
	this.getWordNextStates = function(word){
		word = word.toLowerCase();
		obj = this.getObject(word);
		return this.getNextStates(obj);
	};
	
	this.getNextStates = function(obj){
		var states = {};
		for(var property in obj) {
			if(property != 'state' && property != 'final'){
				for(p in property){
					states[property] = obj[property]['state'];
				}
			}
		}
		return states;
	};
	
	this.each = function(callback){
		recursiveIteration(this.getLex(), function(e, element){
			callback(e, element);
		});
	};
	
	var recursiveIteration = function(element, callback){
		for(e in element){
			callback(e, element);
			if(e != undefined && typeof(element[e]) == 'object'){
				recursiveIteration(element[e], callback);
			}
		}
	};
	
	/* Local storage */
	var updateLexStorage = function(lex){
		storage = {};
		storage.stateCount = lexer.getStateCount();
		storage.alphabet = lexer.getAlphabet();
		storage.verification = lexer.verification;
		storage.lexical = lex;
		localStorage.setItem(lexer.name, JSON.stringify(storage));
	};
	this.getLexStorage = function(){
		return localStorage.getItem(this.name);
	};
	this.cleanLexStorage = function(){
		localStorage.removeItem(this.name);
	};
	
	this.rebuildStates = function(){
		setStateCount(0);
		setAlphabet({});
		this.each(function(e, element){
			if(e == 'state'){
				element[e] = 'q'+incrementStateCount();
			} else if (e.length == 1) {
				addCharToAlphabet(e);
			}
		});
		updateLexStorage(this.getLex());
	};
	
	this.getSuggests = function(word, callback){
		var obj = this.getObject(word);
		buildSuggests(word, obj, callback);
	};
	
	var buildSuggests = function(word, object, callback){
		for (p in object) {
			if (p != 'state') {
				if (object[p]['final']) {
					callback(word + p);
				}
				var newword = word + p;
				buildSuggests(newword, object[p], callback);
			}
		}
	};
	
	this.setExecutionVerification = function(){
		setVerification('execution');
		updateLexStorage(this.getLex());
	};
	
	this.setSpaceVerification = function(){
		setVerification('space');
		updateLexStorage(this.getLex());
	};
	
	/* Local variables */
	this.name = "Lexical";
	this.version = "1.0";
	this.lex = this.startLexical();
	this.lexName = "this.lex";
}

