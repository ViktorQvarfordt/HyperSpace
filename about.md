<!-- title: HyperSpace -->

# HyperSpace

We shall embark in the quest of exploring four-dimensional space. Our medium is the two-dimensional screen. We shall be using two mechanisms for increasing the number of perceived dimensions, each adding +1 dimension:

1. Stereoscopic projection. The perspective gained from having two eyes.
2. Dynamics; time evolution. The perspective gained from moving in space.

How to project four dimensions onto two two dimensions, i.e. the screen? Let's do the math.

## 3 → 2 dimensions

There are various types of projections. We want to mimic the eye. The image captured by the eye consists of all rays passing through the pupil and intersecting the retina. The eye has a lens for practical/physical reasons, lets ignore this. The eye is essentially a [pinhole camera](https://en.wikipedia.org/wiki/Pinhole_camera). In our idealized mathematical world, this is all we need, things are never out of focus. The pupil is the *focal point* and the retina is the *projection plane* (the screen).

We model space by $\mathbb{R}^3$. Let $\vec{p}$ be the focal point, let $\vec{d}$ be the unit vector in the direction in which we look, let the projection plane be the plane normal to $\vec{d}$ going through the point $\vec{p} - f\vec{d}$, where $f$ is the focal length. A point $\vec{q}$ is in the projection plane iff
\[ (\vec{q} - (\vec{p} - f\vec{d})) \cdot \vec{d} = 0. \]


<!--
Thus, the projection plane is
\[ d_1 x + d_2 y + d_3 z = D \]
where we determine $D$ by plugging in $\vec{p} - f\vec{d}$, thus $D = \vec{d} \cdot (\vec{p} - f \vec{d})$.
-->

Let
\[ \vec{r} = \pmatrix{x \\ y \\ z} \]
be any point in space. Our task is to project this point onto the projection plane. The ray between $\vec{r}$ and the focal point $\vec{p}$ is given by
\[ \vec{r} + t (\vec{p} - \vec{r}), \quad t \in \mathbb{R}. \]
This ray intersects the projection plane when it satisfies the equation for the projection plane,
\[ (\vec{r} + t (\vec{p} - \vec{r}) - (\vec{p} - f\vec{d})) \cdot \vec{d} = 0 \]
that is for
\[ t = \frac{(\vec{p}-f\vec{d}-r) \cdot \vec{d}}{(\vec{p}-\vec{r})\cdot\vec{d}} \]
when $t z = f$, that is for $t = f/z$. Thus the projected point (in the projection plane) is given by
\[ \vec{p}_\text{proj} = \frac{f}{z}\pmatrix{x \\ y}. \]


### Stereoscopic projection; two eyes

![](http://taishimizu.com/pictures/3d-considered-harmful/stereoscopic-projection-diagram)
