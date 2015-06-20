function Vector(x, y, z)
{
	this.x = x;
	this.y = y;
	this.z = z;
}

Vector.prototype.sub = function(vec)
{
	return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
}


Vector.prototype.add = function(vec)
{
	return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
}

Vector.prototype.dot = function(vec)
{
	return this.x * vec.x + this.y * vec.y +  this.z * vec.z;
}

// Projekcni rovina
function Plane(pos, scale, w, h)
{
	this.w = w;
	this.h = h
	this.pos = pos;
	this.scale = scale / 2;
}

Plane.prototype.getPixel = function(x, y)
{
	return this.pos.add(new Vector(x * this.scale, y * this.scale, 0));
}

function Sphere(pos, r)
{
	this.pos = pos;
	this.r = r;
}

Sphere.prototype.cast = function(ray)
{
	var a = ray.dir.dot(ray.dir);
	var tmp = ray.start.sub(this.pos);
	var b = 2 * ray.dir.dot(tmp);	
	var c = tmp.dot(tmp) - this.r * this.r;
	var d = b * b - 4 * a * c;
	if(d > 0)
	{
		return 0;
	}
	else
	{
		return null;
	}
}

function createRay(nearPlane, farPlane, x, y)
{
	return { "start" : nearPlane.getPixel(x, y), 
		 "dir" : nearPlane.getPixel(x, y).sub(farPlane.getPixel(x, y))
		};
}

// Vraci barvu pixelu
function rayCast(x, y, objects)
{
	var clippingDistance = 500; // Viditelnost
	var nearPlane = new Plane(new Vector(-200, -150, 0), 1);
	var farPlane = new Plane(new Vector(-200, -150, clippingDistance), 1);

	var ray = createRay(nearPlane, farPlane, x, y);
	for(var i = 0; i < objects.length; i++)
	{
		var hitPos = objects[i].cast(ray);
		if(hitPos != null)
		{
			return "rgb(255, 255, 255)";
		}
	}
	return "rgb(0, 0, 0)";	
}

// Vykresli pixel na dane pozici
function drawPixel(ctx, x, y, col)
{
	ctx.fillStyle = col;
	ctx.fillRect(x, y, 1, 1);
}


window.onload = function()
{
	console.log("Raytracer startuje");
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	for(var y = 0; y < c.height; y++)
	{
		for(var x = 0; x < c.width; x++)
		{
			drawPixel(ctx, x, y, rayCast(x, y, [new Sphere(new Vector(0, 0, 20), 20)]));
		}
	}
}
