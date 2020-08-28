( function( global )
{
	// 12000 yılın saniye cinsinden gösterimi
	const INFINITY = 378691200000;
	// sırayla çerez isimleri
	var keys = [];

	global.cookieStorage =
	{
		length: 0
	}

	/**
	 * cookie saklama alanı için html5 API'leri olan localStorage ve sessionStorage
	 *   ile benzer bir arayüz oluşturur.
	 * 
	 * @class Storage
	 * @access private
	 * @author İsmail Ceylan
	 * @created 2020-08-28T15:25:12+0300
	 */
	function Storage()
	{
		var all = cookies() || {};

		keys = Object.keys( all );

		// tarayıcıda zaten kayıtlı olan çerezleri unserialize edip
		// bu arayüz üzerine getireceğiz böylece erişilebilir olacaklar
		for( var cookie in all )
		{
			global.cookieStorage[ cookie ] = all[ cookie ];
			global.cookieStorage.length++
		}
	}

	/**
	 * Güncel zamana verilen saniye kadar bir süre ekleyip tarih nesnesi olarak
	 *   döndürür.
	 * 
	 * @param {Number} seconds eklenecek saniye
	 * @return {Date}
	 * @access private
	 * @author İsmail Ceylan
	 * @created 2020-08-28T15:30:28+0300
	 */
	function add2CurrentDate( seconds )
	{
		var current = new Date;
		
		current.setTime( current.getTime() + ( seconds * 1000 ));
		return current;
	}

	/**
	 * Parametre olarak verilen veya kullanıcıda kayıtlı çerezleri okur, parçalar ve
	 *   nesne haline getirip döndürür.
	 *
	 * @method get
	 * @param {String} cookie istenen bir cookie değişkeni
	 * @param {String} cookies cookie katarı olarak ele alınması istenen bir string
	 * @return {Object|String|undefined}
	 * @access private
	 * @author Ismail Ceylan
	 * @created 2020-04-21T12:52:37+0300
	 */
	function cookies( cookie, cookies )
	{
		cookies = cookies || document.cookie;
	
		if( ! cookies )
	
			return undefined;
	
		var r = unserializeKeyValue( cookies, "; " );
	
		return cookie
			? r[ cookie ]
			: r;
	}

	/**
	 * key=value{{DELIMITER}}key=value... yapısına uygun string katarı haline
	 *   getirilmiş anahtar ve değer çiftlerini parçalayıp native nesne olarak
	 *   döndürür.
	 *
	 * @method unserializeKeyValue
	 * @param {String} source anahtar değer çiftlerinin string hali
	 * @param {String} delimiter anahtar=değer gruplarını birbirinden ayıran karakter
	 * @param {String} itemDelimiter anahtar=değer çiftleri içinde kullanılan
	 *   ayırıcı karakter (varsayılan "=")
	 * @return {Object}
	 * @access private
	 * @author Ismail Ceylan
	 * @created 2020-04-23T12:14:38+0300
	 */
	function unserializeKeyValue( source, delimiter, itemDelimiter = "=" )
	{
		var r = {};

		if( ! source )

			return r;

		if( delimiter )

			source = source.split( delimiter );
		
		else

			source = [ source ];

		source.map( item =>
		{
			item = item.split( itemDelimiter );

			if( item.length === 0 )

				throw Error( "Syntax error: " + source );

			else if( item.length === 1 )

				r[ "" ] = item[ 0 ];
			
			else
				
				r[ item[ 0 ]] = item[ 1 ];
		});

		return r;
	}

	/**
	 * Tarayıcıya yeni bir cookie ekler.
	 * 
	 * @param {String} name eklenecek cookie adı
	 * @param {String} value cookie değeri
	 * @param {Object} options cookie ayarları
	 * @property {Number} options.ttl cookie'nin ömrü
	 * @property {String} options.path cookie'nin geçerli olacağı alt dizin
	 * @property {String} options.domain cookie'nin geçerli olacağı alan adı
	 * @author İsmail Ceylan
	 * @created 2020-08-28T15:32:56+0300
	 */
	Storage.prototype.setItem = function( name, value, options = { ttl: 60, path: "/", domain: "" })
	{
		// ilk 2 argüman gerekli
		if( arguments.length < 2 )

			throw new TypeError( `Failed to execute 'setItem' on 'Storage': 2 arguments required, but only ${arguments.length} present.` );

		// ömür olarak infinity veya negatif
		// değer verilirse ölümsüz yapacağız
		if( options.ttl === Infinity || options.ttl < 0 )

			options.ttl = INFINITY;

		document.cookie = `${name}=${value}; expires=${add2CurrentDate( options.ttl )}; path=${options.path}; domain=${options.domain}`;
		this[ name ] = value;
		keys.push( name );
		this.length++
	}

	/**
	 * Adı verilen cookie değerini döndürür.
	 * 
	 * @param {String} name değeri istenen cookie adı
	 * @param {mixed} deflt cookie mevcut değilse döndürülecek varsayılan değer
	 * @return {String}
	 * @author İsmail Ceylan
	 * @created 2020-08-28T15:33:04+0300
	 */
	Storage.prototype.getItem = function( name, deflt )
	{
		return this[ name ] || deflt || null;
	}

	/**
	 * Adı verilen cookie'yi sistemden siler.
	 * 
	 * @param {String} name silinecek cookie adı
	 * @author İsmail Ceylan
	 * @created 2020-08-28T15:38:10+0300
	 */
	Storage.prototype.removeItem = function( name )
	{
		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
		delete this[ name ];

		this.length--
	}

	/**
	 * Tarayıcıdaki bütün cookie'leri siler.
	 * 
	 * @author İsmail Ceylan
	 * @created 2020-08-28T15:39:57+0300
	 */
	Storage.prototype.clear = function()
	{
		for( var cookie in cookies())

			this.removeItem( cookie );
	}

	/**
	 * Oluşturma önceliğine bağlı olarak sıra numarası verilen bir
	 *   çerezin değerini döndürür.
	 * 
	 * @param {Number} index istenen cookie'nin oluşturulduğu sıra numarası
	 * @return {String}
	 * @author İsmail Ceylan
	 * @created 2020-08-28T18:02:47+0300
	 */
	Storage.prototype.key = function( index )
	{
		return this.getItem( keys[ index ]);
	}

	// öğe sayısı
	Object.defineProperty( Storage.prototype, "length",
	{
		enumerable: true,
		get()
		{
			return this.length
		}
	});

	// nesne, string türüne zorlandığında [object Storage] yapısı üretilsin
	Object.defineProperty( Storage.prototype, Symbol.toStringTag,
	{
		value: "Storage"
	});

	// ilgili global nesne üzerine storage sınıfını kuralım
	Object.setPrototypeOf(
		global.cookieStorage,
		( new Storage ).__proto__
	);
})
( self );
