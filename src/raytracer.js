function notNull()
{
        for(var i = 0; i < arguments.length; i++)
        {
                if(arguments[i] == null)
                {
                        throw new Error("Hodnota nemuze byt null!");
                }
        }
}

function Material(diffuse, r, g, b)
{
        this.diffuse = diffuse;
        this.x = r;
        this.y = g;
        this.z = b;
}

function Vector(x, y, z)
{
        notNull(x, y, z);
        this.x = x;
        this.y = y;
        this.z = z;
}

Vector.prototype.sub = function(vec)
{
        notNull(vec);
        return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
}


Vector.prototype.add = function(vec)
{
        notNull(vec);
        return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
}

Vector.prototype.dot = function(vec)
{
        notNull(vec);
        return (this.x * vec.x + this.y * vec.y +  this.z * vec.z); 
}

Vector.prototype.angle = function(vec)
{
	return this.dot(vec) /
               (Math.sqrt(this.dot(this)) *  Math.sqrt(vec.dot(vec))); 
}

Vector.prototype.mul = function(n)
{
        notNull(n);
        return new Vector(this.x * n, this.y * n, this.z * n);
}

Vector.prototype.distanceFrom = function(vec)
{
        notNull(vec);
        return Math.sqrt(Math.pow(vec.x - this.x,2) + Math.pow(vec.y - this.y, 2) + 
                        Math.pow(vec.z - this.z, 2));
}

Vector.prototype.magnitude = function()
{
	return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}

Vector.prototype.normalize = function()
{
	var len = this.magnitude();
	if(len != 0)
	{
		return new Vector(this.x / len, this.y / len, this.z / len);
	}
	return new Vector(0, 0, 0);
}

function fuzzyEquals(a, b)
{
        notNull(a, b)
                var delta = 0.0000009;
        return a >= b && a <= b + delta;
}

Vector.prototype.fuzzyEquals = function(vec)
{
        notNull(vec);
        return fuzzyEquals(this.x, vec.x) && fuzzyEquals(this.y, vec.y) && fuzzyEquals(this.z, vec.z);
}

// Projekcni rovina
function Plane(pos, scale)
{
        notNull(pos, scale);
        this.pos = pos;
        this.scale = scale / 2;
}

Plane.prototype.getPixel = function(x, y)
{
        notNull(x, y);
        return this.pos.add(new Vector(x * this.scale, y * this.scale, 0));
}

function Sphere(pos, r)
{
        notNull(pos, r);
        this.pos = pos;
        this.r = r;
        this.material = new Material(0.9,
			Math.round(Math.random() * 255),
			Math.round(Math.random() * 255),
			Math.round(Math.random() * 255))
}

Sphere.prototype.cast = function(ray)
{
        notNull(ray);
        var a = ray.dir.dot(ray.dir);
        var tmp = ray.start.sub(this.pos);
        var b = 2 * ray.dir.dot(tmp);	
        var c = tmp.dot(tmp) - this.r * this.r;
        var d = b * b - 4 * a * c;
        if(d > 0)
        {
                var t1 = (-b + Math.sqrt(d)) / (2 * a);
                var t2 = (-b - Math.sqrt(d)) / (2 * a);
                var t = Math.min(Math.max(0.0, t1), Math.max(0.0, t2));
                if(t > 0.0 && t <= 1.0)
                {
                        return ray.dir.mul(t);
                }
                else
                {
                        return null;
                }
        }
        else
        {
                return null;
        }
}

Sphere.prototype.getNormal = function(pos)
{
	return pos.sub(this.pos).normalize();
}

function createRay(nearPlane, farPlane, x, y)
{
        notNull(nearPlane, farPlane, x, y);
        return { 
                "start" : nearPlane.getPixel(x, y), 
                "dir" : nearPlane.getPixel(x, y).sub(farPlane.getPixel(x, y))
        };
}

function findNearest(ray, objects)
{
        notNull(ray, objects);
        var nearestHit = null;
        for(var i = 0; i < objects.length; i++)
        {
                var hitPos = objects[i].cast(ray);
                if(hitPos != null)
                {
                        if(nearestHit === null || nearestHit.hitPos.distanceFrom(ray.start) > hitPos.distanceFrom(ray.start))
                        {
                                nearestHit = {
                                        "hitPos" : hitPos,
                                        "hitObject" : objects[i]
                                };
                        }
                }
        }
        return nearestHit;
}

// Vraci barvu pixelu
function rayCast(x, y, objects, lights)
{
        notNull(x, y, objects);
        var clippingDistance = 1000; // Viditelnost
        var nearPlane = new Plane(new Vector(-200, -150, -1), 1);
        var farPlane = new Plane(new Vector(-200, -150, clippingDistance), 1);

        var ray = createRay(nearPlane, farPlane, x, y);

        nearestHit = findNearest(ray, objects);

        if(nearestHit === null)
        {
                return "rgb(0, 0, 0)";	
        }	
        else
        {
                var color = nearestHit.hitObject.material;
		var intensity = 0.0;
		var kd = 0.5;
		var ka = 0.1;
		var normal = nearestHit.hitObject.getNormal(nearestHit.hitPos);
		for(var i = 0; i < lights.length; i++)
		{
			ray = {
				"start" : nearestHit.hitPos,
				"dir" : lights[i].sub(nearestHit.hitPos)
			};
			var hit = findNearest(ray, objects);
			if(hit == null)
			{
				var lvec = lights[i].sub(nearestHit.hitPos);
				intensity += (normal.angle(lvec));
			}
		}
                return "rgb(" + Math.round(Math.min(color.x * intensity * kd + color.x * ka, 255)) + ", " 
			+ Math.round(Math.min(color.y * intensity * kd + color.y * ka, 255)) + ", "
			+ Math.round(Math.min(color.z * intensity * kd + color.z * ka, 255)) + ")";	
        }
}

// Vykresli pixel na dane pozici
function drawPixel(ctx, x, y, col)
{
        notNull(ctx, x, y, col);
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
}


window.onload = function()
{
        console.log("Raytracer startuje");
        var c = document.getElementById("canvas");
        var ctx = c.getContext("2d");
        var lights = [new Vector(0, 0, 0),
	    	      new Vector(5, 0, 50)];
        var objects = [new Sphere(new Vector(-10, 0, -30), 20),
	    	       new Sphere(new Vector(10, 0, -30), 20),
	    	       new Sphere(new Vector(0, -10, -30), 20)];
        for(var y = 0; y < c.height; y++)
        {
                for(var x = 0; x < c.width; x++)
                {
                        drawPixel(ctx, x, y, rayCast(x, y, objects, lights));
                }
        }
}
