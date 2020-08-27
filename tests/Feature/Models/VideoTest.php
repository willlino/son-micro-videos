<?php

namespace Tests\Feature\Models;

use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class VideoTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Video::class, 1)->create();
        $videos = Video::all();
        $this->assertCount(1, $videos);
        $videoKey = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id', 'title', 'description', 'year_launched', 'opened', 'rating', 'duration', 'created_at', 'updated_at', 'deleted_at'
        ], $videoKey);
    }

    public function testCreate()
    {
        $video = Video::create([
            'title' => 'title1',
            'description' => 'description1',
            'year_launched' => 2000,
            'opened' => true,
            'rating' => 'L',
            'duration' => 90
        ]);
        $video->refresh();

        $this->assertEquals('title1', $video->title);
        $this->assertEquals('description1', $video->description);
        $this->assertEquals(2000, $video->year_launched);
        $this->assertTrue($video->opened);
        $this->assertEquals('L', $video->rating);
        $this->assertEquals(90, $video->duration);
        $this->assertTrue(preg_match('/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i', $video->id) === 1);
    }

    public function testUpdate()
    {

        $video = factory(Video::class)->create([
            'title' => 'title1',
            'description' => 'description1',
            'year_launched' => 2000,
            'opened' => true,
            'rating' => '10',
            'duration' => 90
        ])->first();

        $data = [
            'title' => 'title_updated',
            'description' => 'description_updated',
            'year_launched' => 2020,
            'opened' => false,
            'rating' => '12',
            'duration' => 115
        ];
        $video->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $video->{$key});
        }
    }

    public function testDelete()
    {
        $video = factory(Video::class, 1)->create()->first();
        $video->refresh();

        $video->delete();
        $videos = Video::all();
        $this->assertCount(0, $videos);
        $this->assertNull(Video::find($video->id));

        $videos = Video::onlyTrashed()->get();
        $this->assertCount(1, $videos);

        $video->restore();
        $this->assertNotNull(Video::find($video->id));
        $this->assertCount(1, $videos);

        $videos = Video::onlyTrashed()->get();
        $this->assertCount(0, $videos);
    }
}
