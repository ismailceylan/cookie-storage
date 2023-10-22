( function( global )
{
	// finite infinity
	const INFINITY = 378691200000;
	// cookies bag
	const keys = [];

	global.cookieStorage =
	{
		length: 0
	}

	/**
	 * The main storage object that will be accessible globally.
	 */
	function Storage()
	{
		const all = cookies() || {};

		keys.push( 
			...Object.keys( all )
		);

		// we will unserialize the cookies already saved in the browser
		// and bring them to this interface so they will be accessible
		for( const cookie in all )
		{
			global.cookieStorage[ cookie ] = all[ cookie ];
			global.cookieStorage.length++
		}
	}

	function add2CurrentDate( seconds )
	{
		const current = new Date;
		
		current.setSeconds(
			current.getSeconds() + seconds
		);

		return current;
	}

	function cookies( cookie, cookies = document.cookie )
	{
		if( ! cookies )
		{
			return undefined;
		}
		
		const r = unserializeKeyValue( cookies, "; " );
	
		return cookie
			? r[ cookie ]
			: r;
	}

	function unserializeKeyValue( source, delimiter, itemDelimiter = "=" )
	{
		const r = {};

		if( ! source )
		{
			return r;
		}
		
		if( delimiter )
		{
			source = source.split( delimiter );
		}
		else
		{
			source = [ source ];
		}
		
		source.map( item =>
		{
			item = item.split( itemDelimiter );

			if( item.length === 0 )
			{
				throw Error( "Syntax error: " + source );
			}
			else if( item.length === 1 )
			{
				r[ "" ] = item[ 0 ];
			}
			else
			{	
				r[ item[ 0 ]] = item[ 1 ];
			}
		});

		return r;
	}

	/**
	 * Adds a new cookie to the browser.
	 * 
	 * @param {String} name cookie name
	 * @param {String} value cookie value
	 * @param {Object} options cookie options
	 * @property {Number} options.ttl cookie life
	 * @property {String} options.path cookie path
	 * @property {String} options.domain cookie domain
	 */
	Storage.prototype.setItem = function( name, value, { ttl: 60, path: "/", domain: "" } = {})
	{
		// we will make sure the first two arguments are present
		if( arguments.length < 2 )
		{
			throw new TypeError( `Failed to execute 'setItem' on 'Storage': 2 arguments required, but only ${arguments.length} present.` );
		}
		
		// If infinity or negative value is given as lifetime
		// we will ensure that the cookie is immortal
		if( ttl === Infinity || ttl < 0 )
		{
			ttl = INFINITY;
		}
		
		document.cookie = `${name}=${value}; expires=${add2CurrentDate( ttl )}; path=${path}; domain=${domain}`;
		this[ name ] = value;
		keys.push( name );
		this.length++
	}

	/**
	 * Returns a cookie's value.
	 * 
	 * @param {String} name cookie name
	 * @param {mixed} deflt default value when cookie not exists
	 * @return {any}
	 */
	Storage.prototype.getItem = function( name, deflt )
	{
		return this[ name ] || deflt || null;
	}

	/**
	 * Removes a cookie.
	 * 
	 * @param {String} name cookie name
	 */
	Storage.prototype.removeItem = function( name )
	{
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
		
		delete this[ name ];

		this.length--
	}

	/**
	 * Wipes out all the cookies.
	 */
	Storage.prototype.clear = function()
	{
		for( const cookie in cookies())
		{
			this.removeItem( cookie );
		}
	}

	/**
	 * Returns cookie value at given index. indexes represent the
  	 * creation order of cookies.
	 * 
	 * @param {Number} index cookie index
	 * @return {String}
	 */
	Storage.prototype.key = function( index )
	{
		return this.getItem( keys[ index ]);
	}

	/**
	 * Cookies count.
	 * 
	 * @var {Number} length
	 */
	Object.defineProperty( Storage.prototype, "length",
	{
		enumerable: true,
		get: () => this.length
	});

	/**
	 * String tag of Storage class.
	 * 
	 * @var {String} Symbol.toStringTag
	 */
	Object.defineProperty( Storage.prototype, Symbol.toStringTag,
	{
		value: "Storage"
	});

	Object.setPrototypeOf(
		global.cookieStorage,
		( new Storage ).__proto__
	);
})
( self );
