<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPUnit\Framework\TestCase;

class CategoryTest extends TestCase
{

    private $category;

    protected function setup(): void
    {
        parent::setUp();
        $this->category = new Category();
    }

    public function testFillable()
    {
        $fillable = ['name', 'description', 'active'];
        $this->assertEquals($fillable, $this->category->getFillable());
    }

    public function testDates()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at', 'field'];
        foreach ($dates as $date) {
            $this->assertContains($date, $this->category->getdates());
        }

        $this->assertCount(count($dates), $this->category->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class, Uuid::class
        ];

        $categoryTraits = array_keys(class_uses(Category::class));
        $this->assertEquals($traits, $categoryTraits);
    }

    public function testCasts()
    {
        $casts = [
            'id' => 'string',
            'active' => 'boolean'
        ];
        $this->assertEquals($casts, $this->category->getCasts());
    }

    public function testIncrementing()
    {
        $this->assertFalse($this->category->incrementing);
    }
}
